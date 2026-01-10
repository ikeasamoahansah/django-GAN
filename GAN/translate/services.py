import google.genai as genai
import json
import re
from django.conf import settings
from django.utils import timezone
from .models import ImageAnalysis
from PIL import Image

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


