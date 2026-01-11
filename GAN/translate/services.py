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
        genai.configure(api_key=settings.GOOGLE_API_KEY)
    
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
            model = genai.GenerativeModel('gemini-pro-vision')
            response = model.generate_content([prompt, img], stream=False)
            
            # Extract response
            response_text = response.text
            
            # Try to parse JSON from response
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


def gan_translate_image(image_file, target_modality):
    """
    Placeholder function for GAN image translation.
    This function should be replaced with actual model loading and inference.
    """
    
    # Load the input image
    input_image = Image.open(image_file)

    # --- Placeholder Logic ---
    # In a real implementation, you would:
    # 1. Determine the source modality from the input image (if not provided).
    # 2. Load the appropriate pre-trained GAN model 
    #    (e.g., a 'CT-to-MRI' model or 'MRI-to-CT' model).
    #    model = load_gan_model(source='CT', target='MRI')
    # 3. Preprocess the input image to match the model's expected format 
    #    (e.g., resize, normalize).
    #    preprocessed_image = preprocess(input_image)
    # 4. Run the model inference.
    #    translated_tensor = model.predict(preprocessed_image)
    # 5. Post-process the output tensor back into an image.
    #    output_image = postprocess(translated_tensor)

    # For now, as a placeholder, we'll just convert the image to grayscale
    # to simulate a transformation.
    if input_image.mode == 'L':
        # if it's already grayscale, convert to RGB to show some change
        output_image = input_image.convert('RGB')
    else:
        output_image = input_image.convert('L')
    
    # --- End of Placeholder Logic ---

    # Save the output image to an in-memory buffer
    buffer = io.BytesIO()
    output_image.save(buffer, format='PNG')
    buffer.seek(0)

    output_filename = f"translated_{target_modality.lower()}.png"

    return buffer.getvalue(), output_filename
