from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from cafeterias.models import Cafeteria, Menu
from reviews.models import Review

from rest_framework import status
from rest_framework.test import APITestCase

class CafeteriaSearchAPITestCase(TestCase):
    def setUp(self):
        self.url = reverse("cafeteria-list")  # 네가 쓰는 name에 맞게 수정

        Cafeteria.objects.create(
            name="학생식당",
            description="테스트",
            location="제1공학관 1층",
            is_active=True,
        )
        Cafeteria.objects.create(
            name="교직원식당",
            description="테스트",
            location="인문관 지하",
            is_active=True,
        )

    def test_search_by_name_or_location(self):
        response = self.client.get(self.url, {"q": "학생"})
        self.assertEqual(response.status_code, 200)

        names = [item["name"] for item in response.data]
        # "학생식당"만 나와야 정상
        self.assertIn("학생식당", names)
        self.assertNotIn("교직원식당", names)

class MenuSearchAPITestCase(TestCase):
    def setUp(self):
        self.url = reverse("menu-search")

        # 식당 2개
        self.c1 = Cafeteria.objects.create(
            name="학생식당",
            description="테스트",
            location="제1공학관 1층",
            is_active=True,
        )
        self.c2 = Cafeteria.objects.create(
            name="교직원식당",
            description="테스트",
            location="인문관 지하",
            is_active=True,
        )

        # 메뉴 3개
        Menu.objects.create(
            cafeteria=self.c1,
            name="김치찌개",
            price=5000,
            is_active=True,
        )
        Menu.objects.create(
            cafeteria=self.c1,
            name="된장찌개",
            price=5000,
            is_active=True,
        )
        Menu.objects.create(
            cafeteria=self.c2,
            name="돈까스",
            price=6500,
            is_active=True,
        )

    def test_search_menu_by_name_or_cafeteria_name(self):
        # "김치"로 검색하면 "김치찌개"만 나와야 함
        response = self.client.get(self.url, {"q": "김치"})
        self.assertEqual(response.status_code, 200)

        names = [item["name"] for item in response.data]
        self.assertIn("김치찌개", names)
        self.assertNotIn("된장찌개", names)
        self.assertNotIn("돈까스", names)

class MenuRatingStatsAPITestCase(TestCase):
    def setUp(self):
        User = get_user_model()

        # 유저 3명 (리뷰 작성자)
        self.user1 = User.objects.create_user(
            username="user1",
            password="testpass1",
        )
        self.user2 = User.objects.create_user(
            username="user2",
            password="testpass2",
        )
        self.user3 = User.objects.create_user(
            username="user3",
            password="testpass3",
        )

        # 식당 & 메뉴
        self.cafeteria = Cafeteria.objects.create(
            name="학생식당",
            description="테스트",
            location="제1공학관 1층",
            is_active=True,
        )
        self.menu = Menu.objects.create(
            cafeteria=self.cafeteria,
            name="김치찌개",
            price=5000,
            is_active=True,
        )

        # 리뷰 3개: 5점, 3점, 1점 → 평균 3.0, 개수 3
        Review.objects.create(
            menu=self.menu,
            author=self.user1,   # 각자 다른 작성자
            rating=5,
            content="맛있어요",
        )
        Review.objects.create(
            menu=self.menu,
            author=self.user2,
            rating=3,
            content="그냥 그래요",
        )
        Review.objects.create(
            menu=self.menu,
            author=self.user3,
            rating=1,
            content="별로였어요",
        )

        self.url = reverse(
            "cafeteria-menu-list",
            kwargs={"cafeteria_id": self.cafeteria.id},
        )

    def test_menu_avg_rating_and_review_count(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(response.data), 1)
        item = response.data[0]

        # 리뷰 개수 확인
        self.assertEqual(item["review_count"], 3)

        # 평균 평점 3.0 근처인지 확인 (float 비교)
        self.assertAlmostEqual(float(item["avg_rating"]), 3.0, places=1)

class MenuPopularAPITestCase(APITestCase):
    def setUp(self):
        User = get_user_model()

        self.user1 = User.objects.create_user(
            username="user1",
            password="testpass1",
        )
        self.user2 = User.objects.create_user(
            username="user2",
            password="testpass2",
        )

        # 식당 2개
        c1 = Cafeteria.objects.create(
            name="학생식당",
            description="테스트",
            location="제1공학관 1층",
            is_active=True,
        )
        c2 = Cafeteria.objects.create(
            name="교직원식당",
            description="테스트",
            location="인문관 지하",
            is_active=True,
        )

        # 메뉴 3개
        self.m1 = Menu.objects.create(
            cafeteria=c1,
            name="김치찌개",
            price=5000,
            is_active=True,
        )
        self.m2 = Menu.objects.create(
            cafeteria=c1,
            name="된장찌개",
            price=5000,
            is_active=True,
        )
        self.m3 = Menu.objects.create(
            cafeteria=c2,
            name="돈까스",
            price=6500,
            is_active=True,
        )

        # 리뷰:
        # m1: 5, 3 (평균 4.0, 개수 2)
        Review.objects.create(
            menu=self.m1,
            author=self.user1,
            rating=5,
            content="맛있어요",
        )
        Review.objects.create(
            menu=self.m1,
            author=self.user2,
            rating=3,
            content="괜찮아요",
        )

        # m2: 4 (평균 4.0, 개수 1)
        Review.objects.create(
            menu=self.m2,
            author=self.user1,
            rating=4,
            content="무난해요",
        )

        # m3: 2 (평균 2.0, 개수 1)
        Review.objects.create(
            menu=self.m3,
            author=self.user2,
            rating=2,
            content="별로였어요",
        )

        self.url = reverse("menu-popular")

    def test_popular_menu_order_and_limit(self):
        # limit=2 로 요청
        response = self.client.get(self.url, {"limit": 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.data), 2)

        # m1, m2 가 인기 순서대로 나와야 함
        names = [item["name"] for item in response.data]
        self.assertEqual(names[0], "김치찌개")
        self.assertEqual(names[1], "된장찌개")

        # 응답에 avg_rating / review_count 포함 확인
        first = response.data[0]
        self.assertIn("avg_rating", first)
        self.assertIn("review_count", first)