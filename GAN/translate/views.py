from rest_framework import viewsets, mixins
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser

from .models import MedicalImage, ImageAnalysis
from .serializers import MedicalImageSerializer, ImageAnalysisSerializer
from .tasks import process_dicom_for_translation
from .services import MedicalImageAnalyzer


class MedicalImageViewSet(viewsets.ModelViewSet):
    queryset = MedicalImage.objects.all()
    serializer_class = MedicalImageSerializer
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        # Associate with user if authenticated
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
    
    def create(self, request, *args, **kwargs):
        """
        Handles the file upload, saves the record, and triggers the Celery task.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 1. Save the model instance
        self.perform_create(serializer)
        image_instance = serializer.instance
        
        # 2. Trigger the asynchronous GAN translation task
        # The Celery task will now need to check image_instance.input_type 
        # to determine if it needs pydicom or simple image loading.
        process_dicom_for_translation.delay(image_instance.id)

        # 3. Return an immediate response 
        headers = self.get_success_headers(serializer.data)
        
        return Response({
            'id': image_instance.id,
            'image_type': image_instance.image_type,
            'status': 'Processing started. Check detail_url for final status.',
            'detail_url': self.request.build_absolute_uri(f'/api/translations/{image_instance.id}/')
        }, status=status.HTTP_202_ACCEPTED, headers=headers)


    
    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        """Analyze a medical image using AI"""
        medical_image = self.get_object()
        
        # Check if already analyzed
        if hasattr(medical_image, 'analysis'):
            return Response(
                {'message': 'Image already analyzed', 
                 'analysis': ImageAnalysisSerializer(medical_image.analysis).data},
                status=status.HTTP_200_OK
            )
        
        try:
            analyzer = MedicalImageAnalyzer()
            analysis = analyzer.analyze_image(medical_image)
            
            return Response(
                {
                    'message': 'Analysis completed successfully',
                    'analysis': ImageAnalysisSerializer(analysis).data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def upload_and_analyze(self, request):
        """Upload and immediately analyze an image"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        medical_image = serializer.save()
        
        try:
            analyzer = MedicalImageAnalyzer()
            analysis = analyzer.analyze_image(medical_image)
            
            return Response(
                {
                    'message': 'Upload and analysis completed',
                    'image': MedicalImageSerializer(
                        medical_image, 
                        context={'request': request}
                    ).data,
                    'analysis': ImageAnalysisSerializer(analysis).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            medical_image.delete()  # Clean up if analysis fails
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
