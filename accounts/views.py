from django.shortcuts import render

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


def parse_body(request):
    """JSON body 파싱 헬퍼 함수"""
    try:
        data = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        data = {}
    return data


@csrf_exempt
def signup_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'POST only'}, status=405)

    data = parse_body(request)
    username = data.get('username')
    password = data.get('password')
    password2 = data.get('password2')
    email = data.get('email', '')

    # 필수값 체크
    if not username or not password or not password2:
        return JsonResponse({'detail': 'username, password, password2는 필수입니다.'},
                            status=400)

    if password != password2:
        return JsonResponse({'detail': '비밀번호가 일치하지 않습니다.'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'detail': '이미 존재하는 사용자명입니다.'}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )

    return JsonResponse(
        {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        },
        status=201,
    )


@csrf_exempt
def login_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'POST only'}, status=405)

    data = parse_body(request)
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return JsonResponse({'detail': 'username과 password는 필수입니다.'},
                            status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'detail': '아이디 또는 비밀번호가 올바르지 않습니다.'},
                            status=400)

    # Django 세션에 로그인
    login(request, user)

    return JsonResponse(
        {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        }
    )


@csrf_exempt
def logout_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'POST only'}, status=405)

    logout(request)
    return JsonResponse({'detail': '로그아웃 되었습니다.'})
