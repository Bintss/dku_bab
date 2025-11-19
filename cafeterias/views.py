from rest_framework import generics
from .models import Cafeteria, Menu
from .serializers import CafeteriaSerializer, MenuSerializer
from django.db import models
from django.shortcuts import render

# Create your views here.
class CafeteriaListAPIView(generics.ListAPIView):
    serializer_class = CafeteriaSerializer

    def get_queryset(self):
        qs = Cafeteria.objects.filter(is_active=True)

        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(
                models.Q(name__icontains=q) |
                models.Q(location__icontains=q)
            )

        return qs

class CafeteriaMenuListAPIView(generics.ListAPIView):
    serializer_class = MenuSerializer

    def get_queryset(self):
        cafeteria_id = self.kwargs["cafeteria_id"]
        return Menu.objects.filter(cafeteria_id=cafeteria_id, is_active=True)

