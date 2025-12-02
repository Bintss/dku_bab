from rest_framework import generics
from .models import Cafeteria, Menu
from .serializers import CafeteriaSerializer, MenuSerializer
from django.db import models
from django.db.models import Avg, Count
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.http import JsonResponse
from django.middleware.csrf import get_token

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

        # superuser 처리
        if user.is_superuser:
            # 관리자(superuser)가 메뉴를 생성할 때는 어느 식당에 넣을지 명시해야 한다.
            if cafeteria is None:
                raise ValidationError("관리자는 메뉴를 생성할 때 cafeteria를 명시해야 합니다.")
            # superuser는 아무 식당에나 추가 가능
            serializer.save(cafeteria=cafeteria)
            return

        # ---- 여기부터 일반 restaurant_owner 처리 ----
        # 1) 우선 serializer에 cafeteria가 실려 왔다면(프론트가 명시적으로 보냈다면) owner 체크
        if cafeteria is not None:
            # 만약 다른 사람 식당이면 막기
            if cafeteria.owner != user:
                raise PermissionDenied("자신이 소유한 식당에만 메뉴를 등록할 수 있습니다.")
        else:
            # 2) 프론트에서 cafeteria를 안 보내는 현재 구조 → 로그인한 유저 기준으로 자동 매핑
            try:
                cafeteria = Cafeteria.objects.get(owner=user)
            except Cafeteria.DoesNotExist:
                # 이 계정과 연결된 식당이 아예 없을 때
                raise PermissionDenied("현재 로그인한 계정에 연결된 식당이 없습니다.")
            except Cafeteria.MultipleObjectsReturned:
                # 한 계정에 여러 식당이 연결된 이상 상황
                raise PermissionDenied("여러 개의 식당이 연결되어 있어 메뉴를 등록할 수 없습니다.")

        # 최종적으로 cafeteria를 확정해서 저장
        serializer.save(cafeteria=cafeteria)


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

def csrf_view(request):
    """
    프론트엔드에서 호출해서 csrftoken 쿠키를 세팅하고,
    토큰 값도 JSON으로 내려주는 엔드포인트
    """
    return JsonResponse({"csrftoken": get_token(request)})