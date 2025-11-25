from django.urls import path
from .views import NoticeListAPIView, NoticeDetailAPIView

app_name = "notices"

urlpatterns = [
    # 공지사항 전체 목록 조회
    path("notices/", NoticeListAPIView.as_view(), name="notice-list"),

    # 개별 공지 상세 조회 (pk는 Notice의 id)
    path("notices/<int:pk>/", NoticeDetailAPIView.as_view(), name="notice-detail"),
]