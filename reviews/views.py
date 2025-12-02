from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from cafeterias.models import Menu
from cafeterias.views import IsRestaurantOwner
from .models import Review
from .serializers import ReviewSerializer, MyReviewSerializer

import json

from django.contrib.auth import get_user_model, authenticate, login, logout
from django.http import JsonResponse


User = get_user_model()


def _json_body(request):
    """요청 body를 JSON으로 파싱 (실패하면 {})"""
    try:
        return json.loads(request.body.decode("utf-8"))
    except Exception:
        return {}


@csrf_exempt
def register_view(request):
    if request.method != "POST":
        return JsonResponse({"detail": "POST 만 허용됩니다."}, status=405)

    data = _json_body(request)
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    password2 = data.get("password2") or ""
    email = (data.get("email") or "").strip()

    if not username or not password or not password2:
        return JsonResponse({"detail": "username, password, password2는 필수입니다."}, status=400)

    if password != password2:
        return JsonResponse({"detail": "비밀번호가 서로 다릅니다."}, status=400)

    if len(password) < 8:
        return JsonResponse({"detail": "비밀번호는 8자 이상이어야 합니다."}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"detail": "이미 존재하는 아이디입니다."}, status=400)

    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
    )

    return JsonResponse(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
        status=201,
    )


@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"detail": "POST 만 허용됩니다."}, status=405)

    data = _json_body(request)
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return JsonResponse({"detail": "username, password는 필수입니다."}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"detail": "아이디 또는 비밀번호가 올바르지 않습니다."}, status=400)

    if not user.is_active:
        return JsonResponse({"detail": "비활성화된 계정입니다."}, status=403)

    login(request, user)  # 세션 생성

    return JsonResponse(
        {
            "message": "로그인 성공",
            "username": user.username,
            "is_staff": user.is_staff #추가 관리자/사용자 구분
        }
    )


@csrf_exempt
def logout_view(request):
    if request.method != "POST":
        return JsonResponse({"detail": "POST 만 허용됩니다."}, status=405)

    logout(request)
    return JsonResponse({"message": "로그아웃 되었습니다."})


def me_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"is_authenticated": False}, status=200)
    
    is_owner_access = (
        request.user.is_superuser
        or request.user.groups.filter(name="restaurant_owner").exists()
    )

    is_owner_access = (
        request.user.is_superuser
        or request.user.groups.filter(name="restaurant_owner").exists()
    )
    return JsonResponse(
        {
            "is_authenticated": True,
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "is_staff": request.user.is_staff,   # 있으면 프론트에서 참고 가능
            "is_owner": is_owner_access, 
        },
        status=200,
    )

#=========================
# 일반 사용자 API
#=========================

class MyReviewDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    로그인한 사용자가 자기 리뷰 하나를 조회/수정/삭제하는 API

    GET    /api/reviews/<pk>/
    PATCH  /api/reviews/<pk>/
    PUT    /api/reviews/<pk>/
    DELETE /api/reviews/<pk>/
    """
    serializer_class = MyReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 로그인한 사용자 본인이 작성한 리뷰만 대상으로 함
        return Review.objects.filter(author=self.request.user)

class MenuReviewListCreateAPIView(generics.ListCreateAPIView):
    """
    특정 메뉴에 대한 리뷰 목록 조회 + 리뷰 작성

    GET /api/menus/<menu_id>/reviews/
    POST /api/menus/<menu_id>/reviews/
    """
    serializer_class = ReviewSerializer

    def get_queryset(self):
        # URL에서 menu_id 가져오기
        menu_id = self.kwargs["menu_id"]
        qs =  Review.objects.filter(menu_id=menu_id)

        # 쿼리 파라미터에서 order_by 값 읽기 (예: ?order_by=rating)
        order_by = self.request.query_params.get("order_by")

        if order_by == "rating":
            # 별점 높은 순, 같은 별점이면 최신순
            qs = qs.order_by("-rating", "-created_at")
        else:
            # 기본: 최신순
            qs = qs.order_by("-created_at")

        return qs

    def perform_create(self, serializer):
        """
        POST 요청으로 리뷰 저장할 때,
        - URL의 menu_id로 Menu 객체 찾고
        - author는 요청한 사용자(request.user)로 설정
        """
        menu_id = self.kwargs["menu_id"]
        menu = Menu.objects.get(pk=menu_id)

        serializer.save(
            menu=menu,
            author=self.request.user,  # 로그인한 유저 기준
        )

class UserReviewListAPIView(generics.ListAPIView):
    serializer_class = MyReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 요청한 유저(request.user)가 쓴 리뷰만 최신순으로 조회
        return Review.objects.filter(author=self.request.user).order_by("-created_at")
    
#=========================
# 식당 주인용 리뷰 API
#=========================

class OwnerReviewListAPIView(generics.ListAPIView):
    """
    식당 주인이 자기 식당에 달린 리뷰만 조회하는 API

    GET /api/owner/reviews/
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Review.objects.all()

        # 로그인한 유저가 owner인 식당의 메뉴에 달린 리뷰만 반환
        return (
            Review.objects
            .filter(menu__cafeteria__owner=user)
            .select_related("menu", "menu__cafeteria")
        )


class OwnerReviewDetailAPIView(generics.RetrieveDestroyAPIView):
    """
    식당 주인이 자기 식당에 달린 특정 리뷰를 조회/삭제하는 API

    GET /api/owner/reviews/<pk>/
    DELETE /api/owner/reviews/<pk>/
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsRestaurantOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Review.objects.all()

        return (
            Review.objects
            .filter(menu__cafeteria__owner=user)
            .select_related("menu", "menu__cafeteria")
        )

    def perform_destroy(self, instance):
        user = self.request.user

        # superuser는 바로 삭제 가능
        if user.is_superuser:
            instance.delete()
            return

        # 본인 소유 식당의 리뷰인지 한 번 더 체크
        if instance.menu.cafeteria.owner != user:
            raise PermissionDenied("자신의 식당 리뷰만 삭제할 수 있습니다.")

        instance.delete()