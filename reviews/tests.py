from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from cafeterias.models import Cafeteria, Menu
from .models import Review


class MenuReviewAPITestCase(APITestCase):
    def setUp(self):
        """
        각 테스트 전에 공통으로 실행되는 준비 코드
        - 유저 1명 생성 + 로그인
        - 식당 1개, 메뉴 1개 생성
        - 해당 메뉴의 리뷰 URL 미리 만들어두기
        """
        User = get_user_model()

        # 테스트용 유저 생성 + 로그인
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword123",
        )
        self.client.login(username="testuser", password="testpassword123")

        # 식당 생성 (필수 필드는 너 모델이랑 맞게 수정 가능)
        self.cafeteria = Cafeteria.objects.create(
            name="학생식당",
            description="테스트용 식당",
            location="공학관 1층",
            is_active=True,
        )

        # 메뉴 생성 (필드 이름/필수 여부에 맞게 필요하면 수정)
        self.menu = Menu.objects.create(
            cafeteria=self.cafeteria,
            name="김치찌개",
            price=5500,
            description="테스트 메뉴",
            is_active=True,
        )

        # 공통으로 쓸 리뷰 API URL
        self.url = f"/api/menus/{self.menu.id}/reviews/"

    def test_get_empty_review_list(self):
        """
        리뷰가 없는 상태에서 GET 하면
        - 200 OK
        - 빈 리스트([])가 오는지 확인
        """
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_create_review(self):
        """
        POST로 리뷰를 하나 생성할 수 있는지 테스트
        - 201 Created
        - DB에 Review 1개 생성
        - menu / author / rating 값이 올바른지 확인
        """
        data = {
            "rating": 5,
            "content": "매우 맛있음",
        }

        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)

        review = Review.objects.first()
        self.assertEqual(review.menu, self.menu)
        self.assertEqual(review.author, self.user)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.content, "매우 맛있음")

    def test_get_review_list_after_create(self):
        """
        리뷰가 1개 있는 상태에서 GET 하면
        - 리스트 길이 1
        - rating / content / author_username / menu.id 가
          우리가 만든 값과 같은지 확인
        """
        Review.objects.create(
            menu=self.menu,
            author=self.user,
            rating=4,
            content="그냥저냥 먹을만함",
        )

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(len(data), 1)

        review_data = data[0]
        self.assertEqual(review_data["rating"], 4)
        self.assertEqual(review_data["content"], "그냥저냥 먹을만함")
        self.assertEqual(review_data["author_username"], self.user.username)
        self.assertEqual(review_data["menu"]["id"], self.menu.id)