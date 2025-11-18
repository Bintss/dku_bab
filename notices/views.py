from rest_framework import generics
from .models import Notice
from .serializers import NoticeSerializer


class NoticeListAPIView(generics.ListAPIView):
    """
    공지사항 목록 조회 API

    - 활성화된 공지만(is_active=True) 반환
    - 상단 고정(is_pinned=True) 공지가 먼저 오고,
      그 다음에는 최신(created_at 내림차순) 순서대로 정렬
    """

    queryset = Notice.objects.filter(is_active=True)
    serializer_class = NoticeSerializer


class NoticeDetailAPIView(generics.RetrieveAPIView):
    """
    개별 공지 상세 조회 API

    - 활성화된 공지에서만 조회
    - URL의 pk(또는 id)로 조회
    """

    queryset = Notice.objects.filter(is_active=True)
    serializer_class = NoticeSerializer
    # lookup_field = "pk"  # 기본값이라 생략 가능