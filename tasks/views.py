from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from .filters import TaskFilter


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Task instances.
    Provides standard CRUD operations, searching, filtering, ordering,
    and custom actions for stats and quick status toggling.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority', 'title']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """
        Return summary statistics for tasks:
        Total, Pending, In Progress, Completed, High/Urgent priority, and Overdue counts.
        """
        all_tasks = self.get_queryset()
        today = timezone.now().date()

        total = all_tasks.count()
        pending = all_tasks.filter(status=Task.STATUS_PENDING).count()
        in_progress = all_tasks.filter(status=Task.STATUS_IN_PROGRESS).count()
        completed = all_tasks.filter(status=Task.STATUS_COMPLETED).count()
        urgent_or_high = all_tasks.filter(
            priority__in=[Task.PRIORITY_HIGH, Task.PRIORITY_URGENT]
        ).count()
        overdue = all_tasks.filter(
            due_date__lt=today
        ).exclude(status=Task.STATUS_COMPLETED).count()

        completion_rate = round((completed / total * 100), 1) if total > 0 else 0

        return Response({
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'completed': completed,
            'urgent_or_high': urgent_or_high,
            'overdue': overdue,
            'completion_rate': completion_rate
        })

    @action(detail=True, methods=['patch'], url_path='toggle')
    def toggle_status(self, request, pk=None):
        """
        Quickly toggle a task's status between Completed and Pending.
        """
        task = self.get_object()
        if task.status == Task.STATUS_COMPLETED:
            task.status = Task.STATUS_PENDING
        else:
            task.status = Task.STATUS_COMPLETED
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)


def index_view(request):
    """Render the main single-page frontend application."""
    return render(request, 'index.html')
