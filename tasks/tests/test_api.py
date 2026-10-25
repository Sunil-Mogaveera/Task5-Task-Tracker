from datetime import timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from tasks.models import Task


class TaskAPITestCase(APITestCase):
    """Integration tests for Task REST API endpoints."""

    def setUp(self):
        self.today = timezone.now().date()
        self.task1 = Task.objects.create(
            title="Frontend Design",
            description="Build responsive UI using CSS grid and flexbox",
            status=Task.STATUS_IN_PROGRESS,
            priority=Task.PRIORITY_HIGH,
            due_date=self.today + timedelta(days=2)
        )
        self.task2 = Task.objects.create(
            title="Backend DRF API",
            description="Implement REST endpoints with pagination and filter",
            status=Task.STATUS_COMPLETED,
            priority=Task.PRIORITY_URGENT,
            due_date=self.today - timedelta(days=1)
        )
        self.task3 = Task.objects.create(
            title="Database Setup",
            description="Configure PostgreSQL and database persistence",
            status=Task.STATUS_PENDING,
            priority=Task.PRIORITY_LOW,
            due_date=self.today + timedelta(days=5)
        )
        self.list_url = reverse('task-list')
        self.home_url = reverse('home')

    def test_frontend_home_view(self):
        """GET / should render the index.html template with 200 OK."""
        response = self.client.get(self.home_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'YRNovatech')
        self.assertContains(response, 'TaskTracker')

    def test_list_tasks_pagination(self):
        """GET /api/tasks/ should return paginated response structure."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('total_pages', response.data)
        self.assertIn('current_page', response.data)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['count'], 3)
        self.assertEqual(len(response.data['results']), 3)

    def test_create_task_success(self):
        """POST /api/tasks/ should create a new task successfully."""
        payload = {
            'title': 'Write Comprehensive Tests',
            'description': 'Cover models, serializers, and views',
            'status': Task.STATUS_PENDING,
            'priority': Task.PRIORITY_MEDIUM,
            'due_date': str(self.today + timedelta(days=7))
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Write Comprehensive Tests')
        self.assertTrue(Task.objects.filter(title='Write Comprehensive Tests').exists())

    def test_create_task_validation_error(self):
        """POST /api/tasks/ with invalid title should return 400 Bad Request."""
        payload = {'title': '  ', 'description': 'No title task'}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    def test_retrieve_task_detail(self):
        """GET /api/tasks/{id}/ should return task details."""
        detail_url = reverse('task-detail', kwargs={'pk': self.task1.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.task1.id)
        self.assertEqual(response.data['title'], self.task1.title)

    def test_update_task_put(self):
        """PUT /api/tasks/{id}/ should replace task data."""
        detail_url = reverse('task-detail', kwargs={'pk': self.task1.id})
        payload = {
            'title': 'Frontend Design Refactored',
            'description': 'Updated UI with dark mode support',
            'status': Task.STATUS_COMPLETED,
            'priority': Task.PRIORITY_MEDIUM,
            'due_date': str(self.today + timedelta(days=1))
        }
        response = self.client.put(detail_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.title, 'Frontend Design Refactored')
        self.assertEqual(self.task1.status, Task.STATUS_COMPLETED)

    def test_partial_update_task_patch(self):
        """PATCH /api/tasks/{id}/ should update only specified fields."""
        detail_url = reverse('task-detail', kwargs={'pk': self.task1.id})
        payload = {'status': Task.STATUS_COMPLETED}
        response = self.client.patch(detail_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.status, Task.STATUS_COMPLETED)
        # title should remain unchanged
        self.assertEqual(self.task1.title, "Frontend Design")

    def test_delete_task(self):
        """DELETE /api/tasks/{id}/ should remove the task."""
        detail_url = reverse('task-detail', kwargs={'pk': self.task1.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task1.id).exists())

    def test_search_tasks(self):
        """Filter tasks by search query across title and description."""
        response = self.client.get(self.list_url, {'search': 'PostgreSQL'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.task3.id)

    def test_filter_tasks_by_status(self):
        """Filter tasks by status parameter."""
        response = self.client.get(self.list_url, {'status': Task.STATUS_COMPLETED})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.task2.id)

    def test_filter_tasks_by_priority(self):
        """Filter tasks by priority parameter."""
        response = self.client.get(self.list_url, {'priority': Task.PRIORITY_LOW})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.task3.id)

    def test_stats_endpoint(self):
        """GET /api/tasks/stats/ should return task summary metrics."""
        stats_url = reverse('task-stats')
        response = self.client.get(stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 3)
        self.assertEqual(response.data['pending'], 1)
        self.assertEqual(response.data['in_progress'], 1)
        self.assertEqual(response.data['completed'], 1)
        self.assertEqual(response.data['urgent_or_high'], 2)

    def test_toggle_status_action(self):
        """PATCH /api/tasks/{id}/toggle/ should toggle completed/pending."""
        toggle_url = reverse('task-toggle-status', kwargs={'pk': self.task3.id})
        # task3 is PENDING, toggle should make it COMPLETED
        response = self.client.patch(toggle_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], Task.STATUS_COMPLETED)

        # toggle again should make it PENDING
        response2 = self.client.patch(toggle_url)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.data['status'], Task.STATUS_PENDING)
