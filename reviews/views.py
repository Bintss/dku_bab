from django.shortcuts import render

import json

from django.contrib.auth import get_user_model, authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

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

    return JsonResponse(
        {
            "is_authenticated": True,
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
        },
        status=200,
    )
