from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from tasks.models import Task


class TaskModelTestCase(TestCase):
    """Unit tests for the Task model."""

    def setUp(self):
        self.today = timezone.now().date()
        self.task = Task.objects.create(
            title="Complete Internship Task 5",
            description="Build full stack task tracker application",
            status=Task.STATUS_PENDING,
            priority=Task.PRIORITY_HIGH,
            due_date=self.today + timedelta(days=3)
        )

    def test_task_creation(self):
        """Verify task attributes are set properly."""
        self.assertEqual(self.task.title, "Complete Internship Task 5")
        self.assertEqual(self.task.status, Task.STATUS_PENDING)
        self.assertEqual(self.task.priority, Task.PRIORITY_HIGH)
        self.assertEqual(self.task.is_overdue, False)

    def test_default_values(self):
        """Verify default values for status and priority."""
        simple_task = Task.objects.create(title="Simple Task")
        self.assertEqual(simple_task.status, Task.STATUS_PENDING)
        self.assertEqual(simple_task.priority, Task.PRIORITY_MEDIUM)
        self.assertEqual(simple_task.description, "")
        self.assertIsNone(simple_task.due_date)

    def test_string_representation(self):
        """Verify the __str__ output."""
        self.assertEqual(str(self.task), "Complete Internship Task 5 [Pending]")

    def test_is_overdue_property(self):
        """Verify overdue logic with past due dates."""
        past_date = self.today - timedelta(days=2)
        overdue_task = Task.objects.create(
            title="Overdue Task",
            due_date=past_date,
            status=Task.STATUS_PENDING
        )
        self.assertTrue(overdue_task.is_overdue)

        # Completed tasks should not be marked overdue even if due date has passed
        overdue_task.status = Task.STATUS_COMPLETED
        overdue_task.save()
        self.assertFalse(overdue_task.is_overdue)
