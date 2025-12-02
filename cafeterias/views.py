from rest_framework import generics
from .models import Cafeteria, Menu
from .serializers import CafeteriaSerializer, MenuSerializer
from django.db import models
from django.db.models import Avg, Count
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.exceptions import PermissionDenied

#=========================
# 일반 사용자 API
#=========================

class CafeteriaListAPIView(generics.ListAPIView):
    serializer_class = CafeteriaSerializer

    def get_queryset(self):
        qs = Cafeteria.objects.filter(is_active=True).annotate(
            avg_rating=Avg("menus__reviews__rating"),
            review_count=Count("menus__reviews", distinct=True)
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

        return qs

class CafeteriaDetailAPIView(generics.RetrieveAPIView):
    serializer_class = CafeteriaSerializer

    def get_queryset(self):
        return Cafeteria.objects.filter(is_active=True).annotate(
            avg_rating=Avg("menus__reviews__rating"),
            review_count=Count("menus__reviews", distinct=True)
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
                review_count=Count("reviews", distinct=True),
            )
            .order_by("name")
        )

class MenuSearchAPIView(generics.ListAPIView):
    serializer_class = MenuSerializer

    def get_queryset(self):
        qs = Menu.objects.filter(is_active=True).annotate(
            avg_rating=Avg("reviews__rating"),
            review_count=Count("reviews", distinct=True),
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
                review_count=Count("reviews", distinct=True),
            )
            .order_by("-avg_rating", "-review_count")
        )
        return qs[:limit]
    
#=========================
# 식당 주인용 API
#=========================

class IsRestaurantOwner(BasePermission):
    """
    식당 주인(restaurant_owner 그룹) 또는 superuser만 허용
    """
    message = "식당 주인만 접근 가능합니다."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return user.groups.filter(name="restaurant_owner").exists()

class OwnerMenuListCreateAPIView(generics.ListCreateAPIView):
    """
    식당 주인이 자기 식당 메뉴만 조회/생성하는 API
    /api/owner/menus/ 에 매핑해서 사용
    """
    serializer_class = MenuSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            qs = Menu.objects.filter(is_active=True)
        else:
            qs = Menu.objects.filter(
                is_active=True,
                cafeteria__owner=user,
            )

        return qs.annotate(
            avg_rating=Avg("reviews__rating"),
            review_count=Count("reviews", distinct=True),
        ).order_by("cafeteria__name", "name")

    def perform_create(self, serializer):
        """
        새 메뉴 생성 시, 현재 로그인한 주인이 소유한 식당에만 메뉴를 추가 가능하게 제한
        """
        user = self.request.user
        cafeteria = serializer.validated_data.get("cafeteria")

        # superuser는 모든 식당에 대해 허용
        if user.is_superuser:
            serializer.save()
            return

        if cafeteria.owner != user:
            raise PermissionDenied("자신이 소유한 식당에만 메뉴를 등록할 수 있습니다.")

        serializer.save()


class OwnerMenuDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    식당 주인이 자기 식당 메뉴만 조회/수정/삭제하는 API
    /api/owner/menus/<pk>/ 에 매핑해서 사용
    """
    serializer_class = MenuSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            qs = Menu.objects.filter(is_active=True)
        else:
            qs = Menu.objects.filter(
                is_active=True,
                cafeteria__owner=user,
            )

        return qs.annotate(
            avg_rating=Avg("reviews__rating"),
            review_count=Count("reviews", distinct=True),
        )

    def perform_update(self, serializer):
        user = self.request.user
        cafeteria = serializer.instance.cafeteria

        if not user.is_superuser and cafeteria.owner != user:
            raise PermissionDenied("자신의 식당 메뉴만 수정할 수 있습니다.")

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        cafeteria = instance.cafeteria

        if not user.is_superuser and cafeteria.owner != user:
            raise PermissionDenied("자신의 식당 메뉴만 삭제할 수 있습니다.")

        instance.delete()