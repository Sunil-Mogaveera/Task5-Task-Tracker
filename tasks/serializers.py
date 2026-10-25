from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the Task model.
    Includes custom validation, human-readable display values, and computed properties.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'status',
            'status_display',
            'priority',
            'priority_display',
            'due_date',
            'is_overdue',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_overdue']

    def validate_title(self, value):
        """Validate title: cannot be empty whitespace, minimum 3 chars."""
        cleaned_value = value.strip()
        if not cleaned_value:
            raise serializers.ValidationError("Title cannot be blank or contain only whitespace.")
        if len(cleaned_value) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long.")
        return cleaned_value

    def validate_description(self, value):
        """Clean description by stripping extraneous whitespace."""
        return value.strip() if value else ''
