from rest_framework import serializers
from .models import Incident, IncidentAttachment
import os




class IncidentAttachmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Incident Attachments
    """
    file_url = serializers.SerializerMethodField()
    file_size_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = IncidentAttachment
        fields = [
            'id', 'file', 'file_url', 'filename', 'file_size', 
            'file_size_formatted', 'attachment_type', 'description', 
            'uploaded_at'
        ]
        read_only_fields = ['id', 'filename', 'file_size', 'uploaded_at']
    
    def get_file_url(self, obj):
        """Get the full URL for the file"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_file_size_formatted(self, obj):
        """Format file size in human readable format"""
        if not obj.file_size:
            return "0 B"
        
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


class IncidentListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for incident list view
    """
    incident_number = serializers.ReadOnlyField()
    attachment_count = serializers.SerializerMethodField()
    days_since_incident = serializers.SerializerMethodField()
    
    class Meta:
        model = Incident
        fields = [
            'id', 'incident_number', 'incident_title', 'category', 
            'sub_category', 'date_of_incident', 'time_of_incident',
            'facility', 'department', 'injury_damage_type', 
            'reported_by_name', 'reporting_date', 'attachment_count',
            'days_since_incident', 'is_active'
        ]
    
    def get_attachment_count(self, obj):
        """Get count of attachments for this incident"""
        return obj.attachments.count()
    
    def get_days_since_incident(self, obj):
        """Calculate days since incident occurred"""
        from django.utils import timezone
        today = timezone.now().date()
        return (today - obj.date_of_incident).days


class IncidentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for incident CRUD operations
    """
    incident_number = serializers.ReadOnlyField()
    attachments = IncidentAttachmentSerializer(many=True, read_only=True)
    attachment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Incident
        fields = [
            # Basic Information
            'id', 'incident_number', 'incident_title', 'date_of_incident', 
            'time_of_incident',
            
            # Location
            'facility', 'department', 'site',
            
            # Classification
            'category', 'sub_category', 'description',
            
            # Persons Involved
            'persons_involved_type', 'persons_involved_details',
            
            # Impact Assessment
            'injury_damage_type', 'injury_damage_details',
            
            # Waste Information
            'waste_type', 'waste_category_code',
            
            # Reporting Information
            'reported_by_type', 'reported_by_name', 'reported_by_contact',
            'reporting_date',
            
            # Attachments & Meta
            'attachments', 'attachment_count',
            
            # System fields
            'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = [
            'id', 'incident_number', 'created_at', 'updated_at'
        ]
    
    def get_attachment_count(self, obj):
        """Get count of attachments"""
        return obj.attachments.count()
    
    def validate_date_of_incident(self, value):
        """Validate incident date is not in future"""
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError(
                "Incident date cannot be in the future."
            )
        return value
    
    def validate_incident_title(self, value):
        """Validate incident title is not empty and unique"""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Incident title cannot be empty."
            )
        
        # Check for uniqueness (excluding current instance in update)
        incident_id = None
        if self.instance:
            incident_id = self.instance.id
            
        if Incident.objects.filter(
            incident_title__iexact=value.strip()
        ).exclude(id=incident_id).exists():
            raise serializers.ValidationError(
                "An incident with this title already exists."
            )
        
        return value.strip()
    
    def validate(self, data):
        """Cross-field validation"""
        # If waste type is not applicable, clear waste category code
        if data.get('waste_type') == 'NOT_APPLICABLE':
            data['waste_category_code'] = None
        
        # If there's waste involved, category code might be required
        elif data.get('waste_type') and data.get('waste_type') != 'NOT_APPLICABLE':
            if not data.get('waste_category_code'):
                raise serializers.ValidationError({
                    'waste_category_code': 'Waste category code is required when waste is involved.'
                })
        
        return data


class IncidentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for creating new incidents
    """
    
    class Meta:
        model = Incident
        fields = [
            'incident_title', 'date_of_incident', 'time_of_incident',
            'facility', 'department', 'site',
            'category', 'sub_category', 'description',
            'persons_involved_type', 'persons_involved_details',
            'injury_damage_type', 'injury_damage_details',
            'waste_type', 'waste_category_code',
            'reported_by_type', 'reported_by_name', 'reported_by_contact'
        ]
        extra_kwargs = {
            'facility': {'required': False, 'allow_blank': True},
            'department': {'required': False, 'allow_blank': True},
            'site': {'required': False, 'allow_blank': True},
            'persons_involved_details': {'required': False, 'allow_blank': True},
            'injury_damage_details': {'required': False, 'allow_blank': True},
        }
    
    def validate_date_of_incident(self, value):
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Incident date cannot be in the future.")
        return value

    def validate(self, data):
        waste_type = data.get('waste_type')
        if waste_type == 'NOT_APPLICABLE':
            data['waste_category_code'] = None
        elif waste_type and not data.get('waste_category_code'):
            raise serializers.ValidationError({
                'waste_category_code': 'Waste category code is required when waste is involved.'
            })
        return data

    def validate_persons_involved_type(self, value):
        if value == "" or value is None:
            return "NOT_APPLICABLE"
        return value

    def validate_injury_damage_type(self, value):
        if value == "" or value is None:
            return "NOT_APPLICABLE"
        return value


class IncidentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating existing incidents
    """
    
    class Meta:
        model = Incident
        fields = [
            'incident_title', 'date_of_incident', 'time_of_incident',
            'facility', 'department', 'site',
            'category', 'sub_category', 'description',
            'persons_involved_type', 'persons_involved_details',
            'injury_damage_type', 'injury_damage_details',
            'waste_type', 'waste_category_code',
            'reported_by_type', 'reported_by_name', 'reported_by_contact',
            'is_active'
        ]
    
    def validate_incident_title(self, value):
        """Validate incident title uniqueness"""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Incident title cannot be empty."
            )
        
        # Check uniqueness excluding current instance
        if Incident.objects.filter(
            incident_title__iexact=value.strip()
        ).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError(
                "An incident with this title already exists."
            )
        
        return value.strip()


class IncidentSummarySerializer(serializers.Serializer):
    """
    Serializer for incident statistics and summary data
    """
    total_incidents = serializers.IntegerField()
    incidents_this_month = serializers.IntegerField()
    incidents_this_week = serializers.IntegerField()
    active_incidents = serializers.IntegerField()
    
    # By Category
    by_category = serializers.DictField(child=serializers.IntegerField())
    
    # By Injury Type
    by_injury_type = serializers.DictField(child=serializers.IntegerField())
    
    # By Facility
    by_facility = serializers.DictField(child=serializers.IntegerField())
    
    # Recent incidents
    recent_incidents = IncidentListSerializer(many=True)
    
    # Trend data
    monthly_trend = serializers.ListField(
        child=serializers.DictField()
    )


class AttachmentUploadSerializer(serializers.ModelSerializer):
    """
    Serializer for uploading attachments to existing incidents
    """
    
    class Meta:
        model = IncidentAttachment
        fields = ['file', 'attachment_type', 'description']
    
    def validate_file(self, value):
        """Validate file upload"""
        # Check file size (limit to 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size cannot exceed {max_size / (1024*1024):.1f} MB"
            )
        
        # Check file extension
        allowed_extensions = [
            '.jpg', '.jpeg', '.png', '.gif', '.bmp',  # Images
            '.mp4', '.avi', '.mov', '.wmv',  # Videos
            '.mp3', '.wav', '.m4a',  # Audio
            '.pdf', '.doc', '.docx', '.txt', '.rtf'  # Documents
        ]
        
        file_extension = os.path.splitext(value.name)[1].lower()
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type '{file_extension}' is not allowed. "
                f"Allowed types: {', '.join(allowed_extensions)}"
            )
        
        return value
    
    def create(self, validated_data):
        """Create attachment with incident reference"""
        incident = self.context.get('incident')
        if not incident:
            raise serializers.ValidationError(
                "Incident reference is required"
            )
        
        return IncidentAttachment.objects.create(
            incident=incident,
            **validated_data
        )
    


