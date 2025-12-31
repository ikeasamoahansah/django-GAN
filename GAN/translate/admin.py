from django.contrib import admin
from .models import MedicalImage, ImageAnalysis

# Register your models here.
admin.site.register(MedicalImage)
admin.site.register(ImageAnalysis)
