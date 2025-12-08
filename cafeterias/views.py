from rest_framework import generics
from .models import Cafeteria, Menu
from .serializers import CafeteriaSerializer, MenuSerializer
from django.db import models
from django.db.models import Avg, Count
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.exceptions import PermissionDenied

# [중요] 리뷰 관리를 위해 reviews 앱의 모델과 시리얼라이저 임포트
from reviews.models import Review
from reviews.serializers import ReviewSerializer

# =========================
# 1. 일반 사용자용 API (기존 코드 유지)
# =========================

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
            qs = qs.order_by("-avg_rating", "-review_count")
        elif ordering == "review_count":
            qs = qs.order_by("-review_count", "-avg_rating")
        else:
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
    
# =========================
# 2. 식당 주인(Owner)용 API
# =========================

class IsRestaurantOwner(BasePermission):
    """
    식당 주인(owner 필드가 있는 유저) 또는 superuser만 허용
    """
    message = "식당 주인만 접근 가능합니다."

    def has_permission(self, request, view):
        # 로그인 여부 확인
        return request.user and request.user.is_authenticated

class OwnerMenuListCreateAPIView(generics.ListCreateAPIView):
    """
    [메뉴 관리]
    GET: 내 식당의 메뉴 목록 조회
    POST: 내 식당에 메뉴 추가
    """
    serializer_class = MenuSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            qs = Menu.objects.all() # 슈퍼유저는 전체 조회 (필요시 필터링)
        else:
            # 내가 주인인 식당의 메뉴만 가져옴
            qs = Menu.objects.filter(cafeteria__owner=user)

        return qs.annotate(
            avg_rating=Avg("reviews__rating"),
            review_count=Count("reviews", distinct=True),
        ).order_by("name")

    def perform_create(self, serializer):
        # 메뉴 생성 시, 자동으로 내 식당(Cafeteria)과 연결
        user = self.request.user
        
        # 슈퍼유저라면 request 데이터에 cafeteria가 있을 수도 있음 (관리자 기능)
        if user.is_superuser:
             serializer.save()
             return

        try:
            # 유저가 소유한 식당을 찾음 (한 유저가 여러 식당 소유 가능하면 로직 수정 필요)
            my_cafeteria = Cafeteria.objects.get(owner=user)
        except Cafeteria.DoesNotExist:
            raise PermissionDenied("소유한 식당이 없습니다. 관리자에게 문의하여 식당을 먼저 등록해주세요.")
        
        # serializer.save() 호출 시 cafeteria 필드를 자동으로 채워줌
        serializer.save(cafeteria=my_cafeteria)


class OwnerMenuDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    [메뉴 상세]
    PUT/PATCH: 메뉴 수정
    DELETE: 메뉴 삭제
    """
    serializer_class = MenuSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Menu.objects.all()
        # 내 식당의 메뉴만 수정/삭제 가능하도록 제한
        return Menu.objects.filter(cafeteria__owner=user)

class OwnerReviewListAPIView(generics.ListAPIView):
    """
    [리뷰 관리]
    GET: 내 식당에 달린 모든 리뷰 조회
    """
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
             return Review.objects.all()
        
        # Review -> Menu -> Cafeteria -> Owner 연결을 통해 조회
        return Review.objects.filter(
            menu__cafeteria__owner=user
        ).order_by("-created_at")

class OwnerReviewDetailAPIView(generics.DestroyAPIView):
    """
    [리뷰 관리]
    DELETE: 내 식당에 달린 리뷰 삭제 (악성 리뷰 등)
    """
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
             return Review.objects.all()
             
        return Review.objects.filter(menu__cafeteria__owner=user)
    
class OwnerCafeteriaDetailAPIView(generics.RetrieveUpdateAPIView):
    """
    [가게 관리]
    GET: 내 식당 정보 조회
    PUT/PATCH: 내 식당 정보(이름, 설명, 운영시간, 이미지 등) 수정
    """
    serializer_class = CafeteriaSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get_object(self):
        # URL에서 ID를 받지 않고, 로그인한 유저가 주인인 식당을 바로 찾아서 반환
        return Cafeteria.objects.get(owner=self.request.user)