from django.shortcuts import render
from rest_framework import viewsets
from .models import Todo
from .serializers import TodoSerializer
from rest_framework.response import Response


# Create your views here.
# @api_view(['GET'])
# def list_todos(request):
#     todos = Todo.objects.all()
#     serializer = TodoSerializer(todos,many=True)
#     return Response(serializer.data)

class TodoViewSet(viewsets.ModelViewSet):
    queryset = Todo.objects.all()
    serializer_class = TodoSerializer





