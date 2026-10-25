from django.db import models
from django.utils import timezone


class Task(models.Model):
    """
    Task model representing an item in the Task Tracker.
    Stores title, description, status, priority, due date, and timestamps.
    """
    STATUS_PENDING = 'PENDING'
    STATUS_IN_PROGRESS = 'IN_PROGRESS'
    STATUS_COMPLETED = 'COMPLETED'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_COMPLETED, 'Completed'),
    ]

    PRIORITY_LOW = 'LOW'
    PRIORITY_MEDIUM = 'MEDIUM'
    PRIORITY_HIGH = 'HIGH'
    PRIORITY_URGENT = 'URGENT'

    PRIORITY_CHOICES = [
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High'),
        (PRIORITY_URGENT, 'Urgent'),
    ]

    title = models.CharField(
        max_length=200,
        help_text="Title of the task (required, max 200 characters)"
    )
    description = models.TextField(
        blank=True,
        default='',
        help_text="Detailed description of the task (optional)"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
        help_text="Current state of the task"
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default=PRIORITY_MEDIUM,
        db_index=True,
        help_text="Priority level of the task"
    )
    due_date = models.DateField(
        null=True,
        blank=True,
        help_text="Target completion date (optional, YYYY-MM-DD)"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the task was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the task was last updated"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return f"{self.title} [{self.get_status_display()}]"

    @property
    def is_overdue(self):
        """Check if the task is overdue based on today's date."""
        if self.due_date and self.status != self.STATUS_COMPLETED:
            return self.due_date < timezone.now().date()
        return False
