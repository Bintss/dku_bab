from django.contrib import admin
from .models import Notice


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    """공지사항 관리 화면 설정"""

    # 목록 화면에 보일 컬럼들
    list_display = (
        "id",
        "title",
        "author",
        "is_pinned",
        "is_active",
        "created_at",
    )

    # 오른쪽 필터 영역
    list_filter = (
        "is_pinned",
        "is_active",
        "created_at",
    )

    # 상단 검색창에서 검색할 필드
    search_fields = (
        "title",
        "content",
        "author__username",
    )

    # 기본 정렬 기준 (모델 Meta.ordering이랑 같게 맞춰줌)
    ordering = ("-is_pinned", "-created_at")

    # 수정 화면에서 읽기 전용 필드
    readonly_fields = (
        "created_at",
        "updated_at",
    )