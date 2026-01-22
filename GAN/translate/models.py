from django.db import models
import uuid

class MedicalImage(models.Model):
    INPUT_TYPE_CHOICES = [
        ('DICOM', 'DICOM File'),
        ('IMAGE', 'Standard Image (PNG/JPG)')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image = models.ImageField(upload_to='medical_images/%Y/%m/%d/')
    image_type = models.CharField(max_length=20, choices=INPUT_TYPE_CHOICES, blank=True)
    modality = models.CharField(max_length=10, choices=[('CT', 'CT'), ('MRI', 'MRI')], blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    translation_status = models.CharField(max_length=50, default='PENDING')
    analyzed_at = models.DateTimeField(null=True, blank=True)
    translated_image = models.ImageField(upload_to='translated_images/%Y/%m/%d/', blank=True, null=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.image_type} - {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"


class ImageAnalysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_image = models.OneToOneField(
        MedicalImage, 
        on_delete=models.CASCADE, 
        related_name='analysis'
    )
    image_type_detected = models.CharField(max_length=200)
    observations = models.JSONField(default=list)
    potential_conditions = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    confidence_score = models.FloatField(null=True, blank=True)
    raw_analysis = models.TextField()
    disclaimer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Image Analyses"
    
    def __str__(self):
        return f"Analysis for {self.medical_image}"


class DICOMData(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_image = models.OneToOneField(
        MedicalImage, 
        on_delete=models.CASCADE, 
        related_name='dicom_data'
    )
    patient_id = models.CharField(max_length=128, blank=True, null=True)
    study_date = models.CharField(max_length=20, blank=True, null=True)
    modality = models.CharField(max_length=16, blank=True, null=True)
    institution_name = models.CharField(max_length=256, blank=True, null=True)
    series_description = models.CharField(max_length=256, blank=True, null=True)
    body_part_examined = models.CharField(max_length=128, blank=True, null=True)
    dicom_metadata = models.JSONField(default=dict, blank=True)
    

    def __str__(self):
        return f"{self.patient_id} | {self.modality}"