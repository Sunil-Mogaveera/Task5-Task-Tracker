from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from tasks.models import Task


class Command(BaseCommand):
    help = 'Seeds sample tasks for YRNovatech Task Tracker demonstration.'

    def handle(self, *args, **options):
        today = timezone.now().date()

        sample_tasks = [
            {
                'title': 'Setup PostgreSQL Database and Models',
                'description': 'Configure database connection settings, models, migrations, and indexing.',
                'status': Task.STATUS_COMPLETED,
                'priority': Task.PRIORITY_HIGH,
                'due_date': today - timedelta(days=2),
            },
            {
                'title': 'Implement Django REST Framework API Endpoints',
                'description': 'Build CRUD ViewSet with serializers, validation, pagination, search, and filtering.',
                'status': Task.STATUS_COMPLETED,
                'priority': Task.PRIORITY_URGENT,
                'due_date': today - timedelta(days=1),
            },
            {
                'title': 'Build Responsive Frontend with HTML5, CSS3, & JS',
                'description': 'Create single page application dashboard, cards layout, modals, and theme switcher.',
                'status': Task.STATUS_IN_PROGRESS,
                'priority': Task.PRIORITY_HIGH,
                'due_date': today + timedelta(days=1),
            },
            {
                'title': 'Integrate Search, Filters, and Pagination Controls',
                'description': 'Hook frontend event listeners to dynamic DRF query params with debounced search.',
                'status': Task.STATUS_IN_PROGRESS,
                'priority': Task.PRIORITY_MEDIUM,
                'due_date': today + timedelta(days=2),
            },
            {
                'title': 'Write Comprehensive Automated Unit & Integration Tests',
                'description': 'Test models, serializers, status transitions, pagination structure, and REST endpoints.',
                'status': Task.STATUS_COMPLETED,
                'priority': Task.PRIORITY_MEDIUM,
                'due_date': today + timedelta(days=3),
            },
            {
                'title': 'Prepare Documentation & README Guide',
                'description': 'Write setup steps, requirements.txt, PostgreSQL instructions, and API references.',
                'status': Task.STATUS_PENDING,
                'priority': Task.PRIORITY_LOW,
                'due_date': today + timedelta(days=5),
            },
            {
                'title': 'Client Form Validation & Server Error Toasting',
                'description': 'Add real-time input error indicators, field-level messages, and animated alerts.',
                'status': Task.STATUS_COMPLETED,
                'priority': Task.PRIORITY_HIGH,
                'due_date': today,
            },
            {
                'title': 'Final Code Review and Internship Submission',
                'description': 'Review all deliverables against YRNovatech Task 5 acceptance criteria.',
                'status': Task.STATUS_PENDING,
                'priority': Task.PRIORITY_URGENT,
                'due_date': today + timedelta(days=7),
            },
        ]

        created_count = 0
        for task_data in sample_tasks:
            task, created = Task.objects.get_or_create(
                title=task_data['title'],
                defaults=task_data
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully seeded {created_count} sample tasks (Total tasks: {Task.objects.count()}).')
        )
