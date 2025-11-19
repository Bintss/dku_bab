from django.test import TestCase
from django.urls import reverse
from cafeterias.models import Cafeteria

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