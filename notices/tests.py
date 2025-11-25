from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Notice


User = get_user_model()


class NoticeAPITestCase(APITestCase):
    """
    공지사항 목록 / 상세 조회 API 테스트
    """

    def setUp(self):
        # 테스트용 사용자 생성 (author용)
        self.user = User.objects.create_user(
            username="tester",
            password="testpassword123",
        )

        # 공지 목록 API URL
        self.list_url = reverse("notices:notice-list")

    def test_get_empty_notice_list(self):
        """
        공지가 하나도 없을 때, 리스트 조회가 빈 배열([])을 반환하는지 테스트
        """
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_get_notice_list_with_pinned_ordering(self):
        """
        상단 고정(is_pinned=True) 공지가 먼저 오고,
        그 다음에는 최신(created_at 내림차순) 순서로 오는지 테스트
        """
        # 오래된 일반 공지
        notice1 = Notice.objects.create(
            title="일반 공지 1",
            content="내용 1",
            author=self.user,
            is_pinned=False,
        )

        # 상단 고정 공지
        notice2 = Notice.objects.create(
            title="상단 고정 공지",
            content="내용 2",
            author=self.user,
            is_pinned=True,
        )

        # 일반 공지 2 (좀 더 최근이라고 가정)
        notice3 = Notice.objects.create(
            title="일반 공지 2",
            content="내용 3",
            author=self.user,
            is_pinned=False,
        )

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        # 응답 순서 확인
        titles = [item["title"] for item in response.data]

        # 1) 상단 고정 공지가 가장 위에 와야 함
        self.assertEqual(titles[0], "상단 고정 공지")

        # 2) 나머지는 created_at 내림차순(최근 것이 앞)
        # notice3가 notice1보다 뒤에 생성되었으므로 더 앞에 위치해야 함
        self.assertIn("일반 공지 2", titles[1:])
        self.assertIn("일반 공지 1", titles[1:])

    def test_get_notice_detail_active_only(self):
        """
        활성화된 공지(is_active=True)는 상세 조회가 되고,
        비활성화 공지(is_active=False)는 404가 나는지 테스트
        """
        active_notice = Notice.objects.create(
            title="활성 공지",
            content="내용",
            author=self.user,
            is_active=True,
        )

        inactive_notice = Notice.objects.create(
            title="비활성 공지",
            content="숨김 처리된 내용",
            author=self.user,
            is_active=False,
        )

        # 활성 공지 상세 조회
        url_active = reverse("notices:notice-detail", args=[active_notice.id])
        response_active = self.client.get(url_active)
        self.assertEqual(response_active.status_code, status.HTTP_200_OK)
        self.assertEqual(response_active.data["title"], "활성 공지")

        # 비활성 공지 상세 조회 → 404여야 함
        url_inactive = reverse("notices:notice-detail", args=[inactive_notice.id])
        response_inactive = self.client.get(url_inactive)
        self.assertEqual(response_inactive.status_code, status.HTTP_404_NOT_FOUND)