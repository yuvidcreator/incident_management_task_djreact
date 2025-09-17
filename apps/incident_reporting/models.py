from django.db import models
from django.utils import timezone
import uuid
import os

# Create your models here.



def incident_attachment_path(instance, filename):
    """Generate file path for incident attachments"""
    return f'incidents/{instance.incident.id}/attachments/{filename}'



class Incident(models.Model):
    """
    Main Incident Model - Phase 1 Requirements
    """
    
    # Choice Fields
    CATEGORY_CHOICES = [
        ('INCIDENT', 'Incident'),
        ('NEAR_MISS', 'Near-Miss'),
        ('UNSAFE_ACT', 'Unsafe Act'),
        ('UNSAFE_CONDITION', 'Unsafe Condition'),
    ]
    
    SUB_CATEGORY_CHOICES = [
        ('FIRE', 'Fire'),
        ('SPILL', 'Spill'),
        ('EXPOSURE', 'Exposure'),
        ('EQUIPMENT_FAILURE', 'Equipment Failure'),
        ('CHEMICAL_LEAK', 'Chemical Leak'),
        ('EXPLOSION', 'Explosion'),
        ('ELECTRICAL', 'Electrical'),
        ('STRUCTURAL', 'Structural'),
        ('ENVIRONMENTAL', 'Environmental'),
        ('OTHER', 'Other'),
    ]
    
    PERSON_TYPE_CHOICES = [
        ('EMPLOYEE', 'Employee'),
        ('CONTRACTOR', 'Contractor'),
        ('THIRD_PARTY', 'Third Party'),
        ('VISITOR', 'Visitor'),
    ]
    
    INJURY_DAMAGE_CHOICES = [
        ('NO_INJURY', 'No Injury'),
        ('MINOR_INJURY', 'Minor Injury'),
        ('MAJOR_INJURY', 'Major Injury'),
        ('FATALITY', 'Fatality'),
        ('PROPERTY_DAMAGE', 'Property Damage'),
        ('ENVIRONMENTAL_IMPACT', 'Environmental Impact'),
        ('NEAR_MISS', 'Near Miss'),
    ]
    
    WASTE_TYPE_CHOICES = [
        ('HAZARDOUS', 'Hazardous'),
        ('NON_HAZARDOUS', 'Non-Hazardous'),
        ('BIOMEDICAL', 'Biomedical'),
        ('E_WASTE', 'E-Waste'),
        ('CHEMICAL', 'Chemical'),
        ('CONSTRUCTION', 'Construction'),
        ('NOT_APPLICABLE', 'Not Applicable'),
    ]
    
    REPORTED_BY_CHOICES = [
        ('EMPLOYEE', 'Employee'),
        ('CONTRACTOR', 'Contractor'),
        ('VISITOR', 'Visitor'),
        ('IOT_SENSOR', 'Automated IoT Sensor Trigger'),
    ]

    # Primary Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # (1) Incident Title / Name
    incident_title = models.CharField(
        max_length=200, 
        unique=True,
        help_text="Unique case identifier or short descriptive name"
    )
    
    # (2) Date of Incident
    date_of_incident = models.DateField(
        help_text="When the incident happened"
    )
    
    # (3) Time of Incident
    time_of_incident = models.TimeField(
        help_text="Exact time of occurrence"
    )
    
    # (4) Location (Facility / Department / Site)
    facility = models.CharField(
        max_length=100, 
        blank=True, null=True ,
        help_text="Location / Facility name where incident occurred"
    )
    department = models.CharField(
        max_length=100, 
        blank=True, null=True ,
        help_text="Department where incident occurred"
    )
    site = models.CharField(
        max_length=100, 
        blank=True, null=True ,
        help_text="Specific site location"
    )
    
    # (5) Category of Incident
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES,
        help_text="Type of incident"
    )
    
    # (6) Sub-Category
    sub_category = models.CharField(
        max_length=20, 
        choices=SUB_CATEGORY_CHOICES, 
        blank=True, 
        null=True,
        help_text="Specific sub-category if applicable"
    )
    
    # (7) Description of Incident
    description = models.TextField(
        help_text="Detailed narrative of what occurred"
    )
    
    # (8) Persons Involved
    persons_involved_type = models.CharField(
        max_length=20, 
        choices=PERSON_TYPE_CHOICES,
        help_text="Type of person involved"
    )
    persons_involved_details = models.TextField(
        blank=True, null=True ,
        help_text="Details of persons involved (names, roles, etc.)"
    )
    
    # (9) Type of Injury or Damage
    injury_damage_type = models.CharField(
        max_length=30, 
        choices=INJURY_DAMAGE_CHOICES,
        help_text="Type of injury or damage occurred"
    )
    injury_damage_details = models.TextField(
        blank=True, 
        null=True,
        help_text="Detailed description of injury or damage"
    )
    
    # (10) Waste Type Involved
    waste_type = models.CharField(
        max_length=20, 
        choices=WASTE_TYPE_CHOICES, 
        default='NOT_APPLICABLE',
        help_text="Type of waste involved if applicable"
    )
    
    # (11) Waste Category / Code
    waste_category_code = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="Regulatory classification (e.g., Hazardous Waste 5.1 – Used Oil)"
    )
    
    # (12) Reported By
    reported_by_type = models.CharField(
        max_length=20, 
        choices=REPORTED_BY_CHOICES,
        help_text="Who reported the incident"
    )
    reported_by_name = models.CharField(
        max_length=100,
        help_text="Name of the person/system that reported"
    )
    reported_by_contact = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Contact information of reporter"
    )
    
    # (13) Reporting Date
    reporting_date = models.DateTimeField(
        default=timezone.now,
        help_text="When the incident was officially logged"
    )
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-reporting_date', '-date_of_incident']
        indexes = [
            models.Index(fields=['date_of_incident']),
            models.Index(fields=['category']),
            models.Index(fields=['facility']),
            models.Index(fields=['reporting_date']),
        ]
        verbose_name = "Incident"
        verbose_name_plural = "Incidents"
    
    def __str__(self):
        return f"{self.incident_title} - {self.date_of_incident}"
    
    @property
    def incident_number(self):
        """Generate a unique incident number"""
        return f"INC-{self.date_of_incident.strftime('%Y%m%d')}-{str(self.id)[:8].upper()}"


class IncidentAttachment(models.Model):
    """
    (14) Attachments Model - Photos, Videos, Voice notes, Documents
    """
    
    ATTACHMENT_TYPE_CHOICES = [
        ('PHOTO', 'Photo'),
        ('VIDEO', 'Video'),
        ('VOICE_NOTE', 'Voice Note'),
        ('DOCUMENT', 'Document'),
        ('OTHER', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    incident = models.ForeignKey(
        Incident, 
        on_delete=models.CASCADE, 
        related_name='attachments'
    )
    
    # File fields
    file = models.FileField(
        upload_to=incident_attachment_path,
        help_text="Upload incident evidence files"
    )
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    attachment_type = models.CharField(
        max_length=15, 
        choices=ATTACHMENT_TYPE_CHOICES,
        help_text="Type of attachment"
    )
    
    # Metadata
    description = models.TextField(
        blank=True, 
        null=True,
        help_text="Description of the attachment"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Incident Attachment"
        verbose_name_plural = "Incident Attachments"
    
    def __str__(self):
        return f"{self.filename} - {self.incident.incident_title}"
    
    def save(self, *args, **kwargs):
        if self.file:
            self.filename = os.path.basename(self.file.name)
            self.file_size = self.file.size
        super().save(*args, **kwargs)

