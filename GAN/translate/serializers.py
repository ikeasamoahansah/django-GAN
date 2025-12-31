from rest_framework import serializers
from .models import MedicalImage, ImageAnalysis

class ImageAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageAnalysis
        fields = [
            'id', 'image_type_detected', 'observations', 
            'potential_conditions', 'recommendations', 
            'confidence_score', 'disclaimer', 'created_at'
        ]

class MedicalImageSerializer(serializers.ModelSerializer):
    analysis = ImageAnalysisSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalImage
        fields = [
            'id', 'image', 'image_url', 'image_type',
            'uploaded_at', 'analyzed_at', 'analysis'
        ]
        read_only_fields = ['id', 'uploaded_at', 'analyzed_at']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def validate(self, data):
        """
        Custom validation to check the file extension and set the image_type.
        """
        uploaded_file = data.get('original_file')
        if not uploaded_file:
            raise serializers.ValidationError("An original file must be provided.")
        
        file_name = uploaded_file.name.lower()
        
        if file_name.endswith(('.dcm', '.dicom')):
            data['image_type'] = 'DICOM'
        elif file_name.endswith(('.jpg', '.jpeg', '.png')):
            data['image_type'] = 'IMAGE'
        else:
            raise serializers.ValidationError(
                "Unsupported file type. Only DICOM (.dcm), JPEG (.jpg), or PNG (.png) are accepted."
            )
            
        return data



