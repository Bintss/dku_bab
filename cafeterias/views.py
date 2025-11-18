from rest_framework import generics
from .models import Cafeteria, Menu
from .serializers import CafeteriaSerializer, MenuSerializer
from django.shortcuts import render

# Create your views here.
class CafeteriaListAPIView(generics.ListAPIView):
    queryset = Cafeteria.objects.filter(is_active=True)
    serializer_class = CafeteriaSerializer

class CafeteriaMenuListAPIView(generics.ListAPIView):
    serializer_class = MenuSerializer

    def get_queryset(self):
        cafeteria_id = self.kwargs["cafeteria_id"]
        return Menu.objects.filter(cafeteria_id=cafeteria_id, is_active=True)

