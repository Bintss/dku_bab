# notices/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrOwnerWriteOnly(BasePermission):
    """
    - GET/HEAD/OPTIONS(조회)은 전체 허용
    - POST/PUT/PATCH/DELETE(쓰기)는 admin 또는 owner만 허용
    """

    def has_permission(self, request, view):
        # 조회 요청은 누구나 OK
        if request.method in SAFE_METHODS:
            return True

        user = request.user

        # 비로그인 사용자는 쓰기 불가
        if not user or not user.is_authenticated:
            return False

        # 관리자
        if user.is_staff:
            return True

        # 식당 주인 여부 (User 모델에 맞게 수정)
        if user.groups.filter(name="restaurant_owner").exists():
            return True
        # 만약 role 필드를 쓰면 이렇게:
        # if getattr(user, "role", None) == "OWNER":
        #     return True

        return False