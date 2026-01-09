from rest_framework import viewsets, mixins
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings


from .models import MedicalImage, ImageAnalysis
from .serializers import MedicalImageSerializer, ImageAnalysisSerializer
from .tasks import process_dicom_for_translation
from .services import MedicalImageAnalyzer

from google.oauth2 import id_token
from google.auth.transport import requests

User = get_user_model()


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            
            # Get user info from the token
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            
            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': first_name,
                    'last_name': last_name,
                }
            )

            # Create session
            login(request, user)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            })
            
        except ValueError:
            return Response(
                {'error': 'Invalid token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class UserMeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
            })
        else:
            return Response(None, status=401)

@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"detail": "CSRF cookie set"})


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"message": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(
        request=request,
        username=username,
        password=password,
    )

    if user is None:
        return Response(
            {"message": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request, user)  # 🔐 creates session

    return Response(
        {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        },
        status=status.HTTP_200_OK,
    )

# Logout

class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]  # How to authenticate
    permission_classes = [IsAuthenticated]  # Who can access
    
    def post(self, request):
        try:
            # Get the refresh token from request
            refresh_token = request.data.get('refresh_token')
            
            if refresh_token:
                # Blacklist the refresh token
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({'message': 'Logged out successfully'}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


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
