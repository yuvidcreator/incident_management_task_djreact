from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import timedelta, datetime
import calendar

from .models import Incident, IncidentAttachment
from .serializers import (
    IncidentListSerializer,
    IncidentDetailSerializer,
    IncidentCreateSerializer,
    IncidentUpdateSerializer,
    IncidentSummarySerializer,
    AttachmentUploadSerializer,
    IncidentAttachmentSerializer
)

# Create your views here.


@method_decorator(csrf_exempt, name='dispatch')
class IncidentViewSet(viewsets.ModelViewSet):
    """
    Complete CRUD ViewSet for Incidents
    """
    queryset = Incident.objects.all().prefetch_related('attachments')
    permission_classes = [AllowAny]  # No authentication required
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    # Filtering and Search
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'category', 'sub_category', 'facility', 'department',
        'injury_damage_type', 'waste_type', 'reported_by_type', 'is_active'
    ]
    search_fields = [
        'incident_title', 'description', 'facility', 'department',
        'persons_involved_details', 'reported_by_name'
    ]
    ordering_fields = [
        'created_at', 'date_of_incident', 'reporting_date', 
        'incident_title', 'facility'
    ]
    ordering = ['-reporting_date', '-date_of_incident']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return IncidentListSerializer
        elif self.action == 'create':
            return IncidentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return IncidentUpdateSerializer
        else:
            return IncidentDetailSerializer
    
    def list(self, request, *args, **kwargs):
        """
        GET /api/incidents/
        List all incidents with pagination and filtering
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        """
        POST /api/incidents/
        Create a new incident
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            print("Validation errors:", e.detail)
            raise
        
        incident = serializer.save()
        
        # Return detailed data of created incident
        detail_serializer = IncidentDetailSerializer(
            incident, context={'request': request}
        )
        
        return Response(
            {
                'message': 'Incident created successfully',
                'incident': detail_serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    def retrieve(self, request, *args, **kwargs):
        """
        GET /api/incidents/{id}/
        Get detailed incident information
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """
        PUT /api/incidents/{id}/
        Update entire incident
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        updated_incident = serializer.save()
        
        # Return detailed data of updated incident
        detail_serializer = IncidentDetailSerializer(
            updated_incident, context={'request': request}
        )
        
        return Response({
            'message': 'Incident updated successfully',
            'incident': detail_serializer.data
        })
    
    def partial_update(self, request, *args, **kwargs):
        """
        PATCH /api/incidents/{id}/
        Partially update incident
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        DELETE /api/incidents/{id}/
        Soft delete incident (set is_active=False)
        """
        instance = self.get_object()
        # instance.is_active = False
        # instance.save()
        # return Response({
        #     'message': 'Incident deactivated successfully'
        # }, status=status.HTTP_200_OK)

        instance.delete()
        return Response({
            'message': 'Incident deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)  # 204 is standard for delete
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_attachment(self, request, pk=None):
        """
        POST /api/incidents/{id}/upload_attachment/
        Upload attachment to specific incident
        """
        incident = self.get_object()
        serializer = AttachmentUploadSerializer(
            data=request.data, 
            context={'incident': incident, 'request': request}
        )
        
        if serializer.is_valid():
            attachment = serializer.save()
            response_serializer = IncidentAttachmentSerializer(
                attachment, context={'request': request}
            )
            return Response({
                'message': 'Attachment uploaded successfully',
                'attachment': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def attachments(self, request, pk=None):
        """
        GET /api/incidents/{id}/attachments/
        Get all attachments for an incident
        """
        incident = self.get_object()
        attachments = incident.attachments.all()
        serializer = IncidentAttachmentSerializer(
            attachments, many=True, context={'request': request}
        )
        return Response({
            'count': attachments.count(),
            'attachments': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        GET /api/incidents/dashboard_stats/
        Get dashboard statistics and summary
        """
        now = timezone.now()
        today = now.date()
        current_month_start = today.replace(day=1)
        current_week_start = today - timedelta(days=today.weekday())
        
        # Basic counts
        total_incidents = Incident.objects.filter(is_active=True).count()
        incidents_this_month = Incident.objects.filter(
            is_active=True,
            date_of_incident__gte=current_month_start
        ).count()
        incidents_this_week = Incident.objects.filter(
            is_active=True,
            date_of_incident__gte=current_week_start
        ).count()
        active_incidents = Incident.objects.filter(is_active=True).count()
        
        # By Category
        by_category = {}
        for choice in Incident.CATEGORY_CHOICES:
            by_category[choice[0]] = Incident.objects.filter(
                is_active=True,
                category=choice[0]
            ).count()
        
        # By Injury Type
        by_injury_type = {}
        for choice in Incident.INJURY_DAMAGE_CHOICES:
            by_injury_type[choice[0]] = Incident.objects.filter(
                is_active=True,
                injury_damage_type=choice[0]
            ).count()
        
        # By Facility
        by_facility = dict(
            Incident.objects.filter(is_active=True)
            .values('facility')
            .annotate(count=Count('facility'))
            .values_list('facility', 'count')
        )
        
        # Recent incidents (last 10)
        recent_incidents = Incident.objects.filter(is_active=True)[:10]
        recent_serializer = IncidentListSerializer(
            recent_incidents, many=True, context={'request': request}
        )
        
        # Monthly trend (last 12 months)
        monthly_trend = []
        for i in range(12):
            month_date = today.replace(day=1) - timedelta(days=i*30)
            month_start = month_date.replace(day=1)
            if month_date.month == 12:
                month_end = month_date.replace(year=month_date.year+1, month=1, day=1) - timedelta(days=1)
            else:
                month_end = month_date.replace(month=month_date.month+1, day=1) - timedelta(days=1)
            
            month_count = Incident.objects.filter(
                is_active=True,
                date_of_incident__gte=month_start,
                date_of_incident__lte=month_end
            ).count()
            
            monthly_trend.append({
                'month': calendar.month_name[month_date.month],
                'year': month_date.year,
                'count': month_count,
                'date': month_start.isoformat()
            })
        
        monthly_trend.reverse()  # Show oldest to newest
        
        stats_data = {
            'total_incidents': total_incidents,
            'incidents_this_month': incidents_this_month,
            'incidents_this_week': incidents_this_week,
            'active_incidents': active_incidents,
            'by_category': by_category,
            'by_injury_type': by_injury_type,
            'by_facility': by_facility,
            'recent_incidents': recent_serializer.data,
            'monthly_trend': monthly_trend,
        }
        
        return Response(stats_data)
    
    @action(detail=False, methods=['get'])
    def choices(self, request):
        """
        GET /api/incidents/choices/
        Get all choice fields for form dropdowns
        """
        choices_data = {
            'categories': [{'value': k, 'label': v} for k, v in Incident.CATEGORY_CHOICES],
            'sub_categories': [{'value': k, 'label': v} for k, v in Incident.SUB_CATEGORY_CHOICES],
            'person_types': [{'value': k, 'label': v} for k, v in Incident.PERSON_TYPE_CHOICES],
            'injury_damage_types': [{'value': k, 'label': v} for k, v in Incident.INJURY_DAMAGE_CHOICES],
            'waste_types': [{'value': k, 'label': v} for k, v in Incident.WASTE_TYPE_CHOICES],
            'reported_by_types': [{'value': k, 'label': v} for k, v in Incident.REPORTED_BY_CHOICES],
            'attachment_types': [{'value': k, 'label': v} for k, v in IncidentAttachment.ATTACHMENT_TYPE_CHOICES],
        }
        return Response(choices_data)


class AttachmentViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for attachments
    """
    queryset = IncidentAttachment.objects.all()
    serializer_class = IncidentAttachmentSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        incident_id = self.kwargs.get("incident_id")
        return IncidentAttachment.objects.filter(incident_id=incident_id)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response(response.data.get('results', response.data))
    
    def destroy(self, request, *args, **kwargs):
        """
        DELETE /api/attachments/{id}/
        Delete an attachment
        """
        instance = self.get_object()
        
        # Delete the actual file
        if instance.file:
            try:
                instance.file.delete(save=False)
            except:
                pass  # File might not exist
        
        instance.delete()
        
        return Response({
            'message': 'Attachment deleted successfully'
        }, status=status.HTTP_200_OK)


