from django.urls import path
from apps.common.views import HelloWorldAPIView


urlpatterns = [
    path("", HelloWorldAPIView.as_view(), name="home-page"),
]