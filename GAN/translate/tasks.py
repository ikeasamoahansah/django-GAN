import os
import pydicom
import numpy as np
from .models import MedicalImage
from celery import shared_task

from PIL import Image

@shared_task
def process_dicom_for_translation(image_id):
    image_instance = MedicalImage.objects.get(pk=image_id)
    image_instance.translation_status = 'PROCESSING'
    image_instance.save()
    
    input_path = image_instance.original_file.path

    try:
        # Determine target modality (Simple heuristic: Swap modality)
        # If uploaded is CT, target is MRI. If MRI, target is CT.
        # This assumes the user wants the 'other' modality.
        
        target_modality = 'MRI'
        if image_instance.modality == 'MRI':
            target_modality = 'CT'
            
        from .services import gan_translate_image
        
        # We need the direct file path or file object
        # Since gan_translate_image takes a file path or bytes, passing the path is easiest.
        input_path = image_instance.image.path
        
        translated_bytes, filename = gan_translate_image(input_path, target_modality)
        
        # Save the result to translated_image field
        from django.core.files.base import ContentFile
        image_instance.translated_image.save(filename, ContentFile(translated_bytes), save=False)
        
        image_instance.translation_status = 'COMPLETED'
        image_instance.save()

    except Exception as e:
        image_instance.translation_status = f'FAILED: {e}'
        image_instance.save()
