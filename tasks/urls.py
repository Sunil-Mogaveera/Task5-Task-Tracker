from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, index_view

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    # Frontend Single Page Application view
    path('', index_view, name='home'),

    # REST API endpoints
    path('api/', include(router.urls)),
]
