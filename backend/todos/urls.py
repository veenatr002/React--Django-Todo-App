from django.contrib import admin
from django.urls import path,include
from rest_framework import routers
from .views import TodoViewSet


# urlpatterns = [
#     path('todos/',list_todos,name='list_todos'),
    
# ]

router = routers.DefaultRouter()
router.register('todos',TodoViewSet)
urlpatterns = router.urls
