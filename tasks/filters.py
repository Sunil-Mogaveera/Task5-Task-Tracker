import django_filters
from .models import Task


class TaskFilter(django_filters.FilterSet):
    """
    FilterSet for Task queries.
    Allows filtering by status, priority, and due_date range.
    """
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')
    priority = django_filters.CharFilter(field_name='priority', lookup_expr='exact')
    due_date_after = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_date_before = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')

    class Meta:
        model = Task
        fields = ['status', 'priority', 'due_date']
