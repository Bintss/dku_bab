from django.conf import settings
from django.db import models


class Notice(models.Model):
    """식당/서비스 공지사항"""
    title = models.CharField(max_length=200)
    content = models.TextField()
    # 공지 작성자 (관리자) - 로그인/권한은 나중에 구현
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notices",
    )
    is_pinned = models.BooleanField(default=False)   # 상단 고정 여부
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)    # 비활성화 공지 숨김용

    class Meta:
        ordering = ["-is_pinned", "-created_at"]

    def __str__(self):
        return self.title