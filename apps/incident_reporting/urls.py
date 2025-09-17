from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


# Create router and register viewsets
router = DefaultRouter()
router.register(r'incidents', views.IncidentViewSet, basename='incident')
# router.register(r'attachments', views.AttachmentViewSet, basename='attachment')
router.register(r"incidents/(?P<incident_id>\d+)/attachments", views.AttachmentViewSet, basename="incident-attachments")


urlpatterns = [
    path('', include(router.urls)),
]

