from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from cafeterias.models import Menu, Cafeteria
from .models import Review

User = get_user_model()


class MenuReviewOrderAPITestCase(TestCase):
    def setUp(self):
        # 1) 유저 여러 명 생성
        self.user1 = User.objects.create_user(
            username="testuser1",
            password="testpass",
        )
        self.user2 = User.objects.create_user(
            username="testuser2",
            password="testpass",
        )
        self.user3 = User.objects.create_user(
            username="testuser3",
            password="testpass",
        )

        # 2) 메뉴(및 카페테리아) 생성
        cafeteria = Cafeteria.objects.create(
            name="학생식당",
            description="테스트 식당",
            location="1층",
            is_active=True,
        )
        self.menu = Menu.objects.create(
            cafeteria=cafeteria,
            name="돈까스",
            price=7000,
            description="테스트 메뉴",
            is_sold_out=False,
            is_active=True,
        )

        # 3) 테스트할 URL
        self.url = reverse(
            "reviews:menu-review-list",
            kwargs={"menu_id": self.menu.id},
        )

    def test_default_order_latest(self):
        """기본 정렬: 최신 생성 순(내림차순)"""
        r1 = Review.objects.create(
            menu=self.menu,
            author=self.user1,   # ✅ 서로 다른 author
            rating=3,
            content="첫 번째",
        )
        r2 = Review.objects.create(
            menu=self.menu,
            author=self.user2,   # ✅ 다른 author
            rating=5,
            content="두 번째",
        )

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

        ids = [item["id"] for item in response.data]
        # 최신 생성(r2)이 먼저 와야 함
        self.assertEqual(ids, [r2.id, r1.id])

    def test_order_by_rating(self):
        """정렬 파라미터: rating 기준 내림차순"""
        r1 = Review.objects.create(
            menu=self.menu,
            author=self.user1,
            rating=3,
            content="3점",
        )
        r2 = Review.objects.create(
            menu=self.menu,
            author=self.user2,
            rating=5,
            content="5점",
        )
        r3 = Review.objects.create(
            menu=self.menu,
            author=self.user3,
            rating=1,
            content="1점",
        )

        response = self.client.get(self.url + "?order_by=rating")
        self.assertEqual(response.status_code, 200)

        ratings = [item["rating"] for item in response.data]
        # 별점 높은 순: 5, 3, 1
        self.assertEqual(ratings, [5, 3, 1])