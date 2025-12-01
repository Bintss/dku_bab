from rest_framework import generics
from .models import Cafeteria, Menu
from .serializers import CafeteriaSerializer, MenuSerializer
from django.db import models
from django.db.models import Avg, Count

class CafeteriaListAPIView(generics.ListAPIView):
    serializer_class = CafeteriaSerializer

    def get_queryset(self):
        qs = Cafeteria.objects.filter(is_active=True).annotate(
            avg_rating=Avg("menus__reviews__rating"),
            review_count=Count("menus__reviews")
        )

        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(
                models.Q(name__icontains=q) |
                models.Q(location__icontains=q)
            )
        ordering = self.request.query_params.get("ordering")
        if ordering == "avg_rating":
            # 별점 높은 순 -> 리뷰 많은 순
            qs = qs.order_by("-avg_rating", "-review_count")
        elif ordering == "review_count":
            # 리뷰 많은 순 -> 별점 높은 순
            qs = qs.order_by("-review_count", "-avg_rating")
        else:
            # 기본: 이름순
            qs = qs.order_by("name")        
        return qs.order_by("name")

class CafeteriaDetailAPIView(generics.RetrieveAPIView):
    serializer_class = CafeteriaSerializer

    def get_queryset(self):
        return Cafeteria.objects.filter(is_active=True).annotate(
            avg_rating=Avg("menus__reviews__rating"),
            review_count=Count("menus__reviews")
        )

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
            .order_by("name")
        )

class MenuSearchAPIView(generics.ListAPIView):
    serializer_class = MenuSerializer

    def get_queryset(self):
        qs = Menu.objects.filter(is_active=True).annotate(
            avg_rating=Avg("reviews__rating"),
            review_count=Count("reviews"),
        )

        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(
                models.Q(name__icontains=q) |
                models.Q(cafeteria__name__icontains=q)
            )
        return qs

class PopularMenuListAPIView(generics.ListAPIView):
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

# from rest_framework import viewsets, permissions
# from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

# from .models import Cafeteria, Menu
# from .serializers import CafeteriaSerializer, MenuSerializer


# class CafeteriaViewSet(viewsets.ModelViewSet):
#     queryset = Cafeteria.objects.all().order_by('id')
#     serializer_class = CafeteriaSerializer
#     parser_classes = [MultiPartParser, FormParser, JSONParser]
#     permission_classes = [permissions.AllowAny]  # 필요 시 수정 가능


# class MenuViewSet(viewsets.ModelViewSet):
#     queryset = Menu.objects.all().order_by('id')
#     serializer_class = MenuSerializer
#     parser_classes = [MultiPartParser, FormParser, JSONParser]
#     permission_classes = [permissions.AllowAny]  # 필요 시 수정 가능
