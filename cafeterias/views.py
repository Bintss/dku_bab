from rest_framework import generics
from .models import Cafeteria, Menu
from .serializers import CafeteriaSerializer, MenuSerializer
from django.db import models
from django.db.models import Avg, Count
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

        return (
            Menu.objects
            .filter(cafeteria_id=cafeteria_id, is_active=True)
            .annotate(
                avg_rating=Avg("reviews__rating"),
                review_count=Count("reviews"),
            )
        )

class MenuSearchAPIView(generics.ListAPIView):
    serializer_class = MenuSerializer

    def get_queryset(self):
        qs = Menu.objects.filter(is_active=True)

        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(
                models.Q(name__icontains=q) |
                models.Q(cafeteria__name__icontains=q)
            )
        return qs
    
class PopularMenuListAPIView(generics.ListAPIView):
    """
    인기 메뉴 목록 API
    - 기본 정렬: 평균 평점 내림차순 → 리뷰 수 내림차순
    - ?limit=5 로 개수 제한 가능 (기본 10개)
    """
    serializer_class = MenuSerializer

    def get_queryset(self):
        limit = self.request.query_params.get("limit")
        try:
            limit = int(limit) if limit is not None else 10
        except ValueError:
            limit = 10

        qs = (
            Menu.objects
            .filter(is_active=True)
            .annotate(
                avg_rating=Avg("reviews__rating"),
                review_count=Count("reviews"),
            )
            .order_by("-avg_rating", "-review_count")
        )
        return qs[:limit]