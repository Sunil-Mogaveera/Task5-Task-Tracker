from django.test import TestCase
from rest_framework.exceptions import ValidationError
from tasks.models import Task
from tasks.serializers import TaskSerializer


class TaskSerializerTestCase(TestCase):
    """Unit tests for TaskSerializer validation and serialization."""

    def test_valid_serializer(self):
        """Serializer should be valid with proper payload."""
        payload = {
            'title': 'Test Valid Task',
            'description': 'Valid description',
            'status': Task.STATUS_IN_PROGRESS,
            'priority': Task.PRIORITY_URGENT,
            'due_date': '2026-12-31'
        }
        serializer = TaskSerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        task = serializer.save()
        self.assertEqual(task.title, 'Test Valid Task')
        self.assertEqual(task.status, Task.STATUS_IN_PROGRESS)

    def test_blank_title_validation(self):
        """Title cannot be blank or only whitespace."""
        payload = {'title': '   '}
        serializer = TaskSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)

    def test_short_title_validation(self):
        """Title must be at least 3 characters long."""
        payload = {'title': 'ab'}
        serializer = TaskSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)

    def test_invalid_status_choice(self):
        """Invalid status choice should raise validation error."""
        payload = {'title': 'Valid Title', 'status': 'NON_EXISTENT'}
        serializer = TaskSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn('status', serializer.errors)

    def test_read_only_fields_included(self):
        """Serializer output should include read-only fields."""
        task = Task.objects.create(title="Sample Task")
        serializer = TaskSerializer(instance=task)
        self.assertIn('status_display', serializer.data)
        self.assertIn('priority_display', serializer.data)
        self.assertIn('is_overdue', serializer.data)
        self.assertIn('created_at', serializer.data)
