from django.contrib import admin
from .models import Incident, IncidentAttachment

# Register your models here.



@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = [
        'incident_number', 'incident_title', 'category', 
        'date_of_incident', 'facility', 'injury_damage_type', 
        'reported_by_name', 'reporting_date'
    ]
    list_filter = [
        'category', 'sub_category', 'injury_damage_type', 
        'facility', 'reported_by_type', 'date_of_incident'
    ]
    search_fields = [
        'incident_title', 'description', 'facility', 
        'department', 'reported_by_name'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at', 'incident_number']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'incident_title', 'date_of_incident', 'time_of_incident',
                'category', 'sub_category', 'description'
            )
        }),
        ('Location Details', {
            'fields': ('facility', 'department', 'site')
        }),
        ('Persons Involved', {
            'fields': ('persons_involved_type', 'persons_involved_details')
        }),
        ('Impact Assessment', {
            'fields': (
                'injury_damage_type', 'injury_damage_details',
                'waste_type', 'waste_category_code'
            )
        }),
        ('Reporting Information', {
            'fields': (
                'reported_by_type', 'reported_by_name', 'reported_by_contact',
                'reporting_date'
            )
        }),
        ('System Information', {
            'fields': ('id', 'incident_number', 'created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )

@admin.register(IncidentAttachment)
class IncidentAttachmentAdmin(admin.ModelAdmin):
    list_display = [
        'filename', 'incident', 'attachment_type', 
        'file_size', 'uploaded_at'
    ]
    list_filter = ['attachment_type', 'uploaded_at']
    search_fields = ['filename', 'incident__incident_title', 'description']
    readonly_fields = ['id', 'filename', 'file_size', 'uploaded_at']

