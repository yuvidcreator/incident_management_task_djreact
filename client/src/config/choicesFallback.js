// src/config/choicesFallback.js
const CHOICES = {
    categories: [
        { value: 'INCIDENT', label: 'Incident' },
        { value: 'NEAR_MISS', label: 'Near-Miss' },
        { value: 'UNSAFE_ACT', label: 'Unsafe Act' },
        { value: 'UNSAFE_CONDITION', label: 'Unsafe Condition' },
    ],

    sub_categories: [
        { value: 'FIRE', label: 'Fire' },
        { value: 'SPILL', label: 'Spill' },
        { value: 'EXPOSURE', label: 'Exposure' },
        { value: 'EQUIPMENT_FAILURE', label: 'Equipment Failure' },
        { value: 'CHEMICAL_LEAK', label: 'Chemical Leak' },
        { value: 'EXPLOSION', label: 'Explosion' },
        { value: 'ELECTRICAL', label: 'Electrical' },
        { value: 'STRUCTURAL', label: 'Structural' },
        { value: 'ENVIRONMENTAL', label: 'Environmental' },
        { value: 'OTHER', label: 'Other' },
    ],

    person_types: [
        { value: 'EMPLOYEE', label: 'Employee' },
        { value: 'CONTRACTOR', label: 'Contractor' },
        { value: 'THIRD_PARTY', label: 'Third Party' },
        { value: 'VISITOR', label: 'Visitor' },
    ],

    injury_damage_types: [
        { value: 'NO_INJURY', label: 'No Injury' },
        { value: 'MINOR_INJURY', label: 'Minor Injury' },
        { value: 'MAJOR_INJURY', label: 'Major Injury' },
        { value: 'FATALITY', label: 'Fatality' },
        { value: 'PROPERTY_DAMAGE', label: 'Property Damage' },
        { value: 'ENVIRONMENTAL_IMPACT', label: 'Environmental Impact' },
        { value: 'NEAR_MISS', label: 'Near Miss' },
    ],

    waste_types: [
        { value: 'HAZARDOUS', label: 'Hazardous' },
        { value: 'NON_HAZARDOUS', label: 'Non-Hazardous' },
        { value: 'BIOMEDICAL', label: 'Biomedical' },
        { value: 'E_WASTE', label: 'E-Waste' },
        { value: 'CHEMICAL', label: 'Chemical' },
        { value: 'CONSTRUCTION', label: 'Construction' },
        { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
    ],

    reported_by_types: [
        { value: 'EMPLOYEE', label: 'Employee' },
        { value: 'CONTRACTOR', label: 'Contractor' },
        { value: 'VISITOR', label: 'Visitor' },
        { value: 'IOT_SENSOR', label: 'Automated IoT Sensor Trigger' },
    ],

    attachment_types: [
        { value: 'PHOTO', label: 'Photo' },
        { value: 'VIDEO', label: 'Video' },
        { value: 'VOICE_NOTE', label: 'Voice Note' },
        { value: 'DOCUMENT', label: 'Document' },
        { value: 'OTHER', label: 'Other' },
    ]
};

export default CHOICES;
