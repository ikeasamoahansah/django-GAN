import google.genai as genai
import json
import re
from django.conf import settings
from django.utils import timezone
from .models import ImageAnalysis
from PIL import Image
import io

class MedicalImageAnalyzer:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    def analyze_image(self, medical_image):
        """Analyze medical image using Gemini API"""
        
        image_path = medical_image.image.path
        
        # Create analysis prompt
        prompt = """Analyze this medical image and provide a detailed report in JSON format.

Your response must be ONLY valid JSON with these exact keys:
{
  "imageType": "Type of medical imaging (X-ray, MRI, CT, etc.)",
  "observations": ["Array of key observations"],
  "potentialConditions": ["Array of possible conditions or findings"],
  "recommendations": ["Array of recommendations"],
  "confidenceScore": 0.85,
  "disclaimer": "Disclaimer text"
}

Important guidelines:
1. Be thorough but concise
2. Use medical terminology appropriately
3. Include confidence score (0-1) based on image quality and clarity
4. Always include disclaimer about educational purposes
5. Do not provide definitive diagnoses
6. Suggest consulting healthcare professionals

Return ONLY the JSON object, no markdown formatting."""

        try:
            img = Image.open(image_path)
            
            response = self.client.models.generate_content(
                model='gemini-2.0-flash', 
                contents=[prompt, img]
            )
            
            # Extract response
            response_text = response.text
            
            # Try to parse JSON from response
            # Sometimes the model returns ```json ... ``` blocks
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                analysis_data = json.loads(json_match.group())
            else:
                # Fallback if no JSON found
                analysis_data = {
                    "imageType": "Unknown",
                    "observations": [response_text],
                    "potentialConditions": [],
                    "recommendations": ["Consult with a healthcare professional"],
                    "confidenceScore": 0.5,
                    "disclaimer": "This analysis is for educational purposes only."
                }
            
            # Create ImageAnalysis record
            analysis = ImageAnalysis.objects.create(
                medical_image=medical_image,
                image_type_detected=analysis_data.get('imageType', 'Unknown'),
                observations=analysis_data.get('observations', []),
                potential_conditions=analysis_data.get('potentialConditions', []),
                recommendations=analysis_data.get('recommendations', []),
                confidence_score=analysis_data.get('confidenceScore', 0.5),
                raw_analysis=response_text,
                disclaimer=analysis_data.get('disclaimer', 'For educational purposes only.')
            )
            
            # Update medical_image
            medical_image.analyzed_at = timezone.now()
            medical_image.image_type = analysis_data.get('imageType', '')[:20]
            medical_image.save()
            
            return analysis
            
        except Exception as e:
            raise Exception(f"Analysis failed: {str(e)}")


import torch
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import io
import os

# Import network definitions
try:
    from models.networks import define_G
except ImportError:
    try:
        from GAN.models.networks import define_G
    except ImportError:
         # Fallback for relative import if run as package
        from ..models.networks import define_G

class GANTranslator:
    def __init__(self, target_modality, device=None):
        self.device = device if device else ('cuda' if torch.cuda.is_available() else 'cpu')
        self.target_modality = target_modality.upper()
        self.model = self._load_model()

    def _load_model(self):
        """
        Load the generator model based on target modality.
        User specified:
        - G_A: CT -> MRI (Target: MRI)
        - G_B: MRI -> CT (Target: CT)
        """
        # Configuration
        input_nc = 3 # RGB
        output_nc = 3 # RGB
        ngf = 64
        netG = 'HPB'
        norm = 'instance'
        
        # Initialize model
        model = define_G(input_nc, output_nc, ngf, netG, norm=norm, init_type='normal', init_gain=0.02, gpu_ids=[])
        
        # Determine weights path
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # .../GAN
        models_dir = os.path.join(base_path, 'models')
        
        if self.target_modality == 'MRI':
            weights_name = 'latest_net_G_A.pth' 
        elif self.target_modality == 'CT':
            weights_name = 'latest_net_G_B.pth'
        else:
            raise ValueError(f"Unsupported target modality: {self.target_modality}")
            
        weights_path = os.path.join(models_dir, weights_name)
        
        if not os.path.exists(weights_path):
             # Try Django settings base dir as fallback
            try:
                weights_path = os.path.join(settings.BASE_DIR, 'GAN', 'models', weights_name)
            except:
                pass

        if os.path.exists(weights_path):
            state_dict = torch.load(weights_path, map_location=self.device)
            # Handle DataParallel wrapping if present in saved weights
            if list(state_dict.keys())[0].startswith('module.'):
                state_dict = {k[7:]: v for k, v in state_dict.items()}
            model.load_state_dict(state_dict)
            print(f"Loaded weights from {weights_path}")
        else:
            print(f"WARNING: Weights not found at {weights_path}. Using random initialization.")
        
        model.to(self.device)
        model.eval()
        return model

    def preprocess(self, image):
        """
        Resize to 256x256, convert to RGB, normalize to [-1, 1]
        """
        # Ensure image is RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        transform = transforms.Compose([
            transforms.Resize((256, 256), Image.BICUBIC),
            transforms.ToTensor(),
            transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
        ])
        return transform(image).unsqueeze(0).to(self.device)

    def postprocess(self, tensor):
        """
        Denormalize [-1, 1] -> [0, 255], convert to PIL
        """
        image = tensor.cpu().detach().float().numpy()
        image = (np.transpose(image, (0, 2, 3, 1)) + 1) / 2.0 * 255.0
        image = image.clip(0, 255).astype(np.uint8)
        image = image[0, ..., 0]  # Remove batch and channel dims for grayscale
        return Image.fromarray(image)

    def translate(self, image):
        img_tensor = self.preprocess(image)
        with torch.no_grad():
            output_tensor = self.model(img_tensor)
        return self.postprocess(output_tensor)


def gan_translate_image(image_file, target_modality):
    """
    Main entry point for GAN translation.
    """
    # Load input image
    try:
        input_image = Image.open(image_file)
    except Exception:
        # If it's bytes, wrap in BytesIO
        if isinstance(image_file, (bytes, bytearray)):
             input_image = Image.open(io.BytesIO(image_file))
        else:
            raise

    # Initialize translator
    translator = GANTranslator(target_modality)
    
    # Run inference
    output_image = translator.translate(input_image)
    
    # Save to buffer
    buffer = io.BytesIO()
    output_image.save(buffer, format='PNG')
    buffer.seek(0)
    
    output_filename = f"translated_{target_modality.lower()}.png"
    
    return buffer.getvalue(), output_filename
