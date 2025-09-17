from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView


class HelloWorldAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        tags=["Hello World"],
        security=[],
        # request_body=
    )
    def get(self, request):
        obj = {
            "message": "Hello World",
        }
        return Response(obj, status=status.HTTP_200_OK)