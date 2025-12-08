from django.db import models
from django.conf import settings

class Cafeteria(models.Model):
    name = models.CharField(max_length=100)           # 식당 이름
    description = models.CharField(max_length=255, blank=True)  # 간단 설명
    operating_hours = models.CharField(max_length=100, blank=True)  # 영업 시간
    location = models.CharField(max_length=200, blank=True)     # 건물/층 정보
    image = models.ImageField(
        upload_to="cafeteria_images/",
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(default=True)     # 운영 중인지 여부

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cafeterias',
        null=True,
        blank=True, 
    )

    def __str__(self):
        return self.name


class Menu(models.Model):
    """메뉴 정보"""
    cafeteria = models.ForeignKey(
        Cafeteria,
        on_delete=models.CASCADE,
        related_name="menus",
    )
    name = models.CharField(max_length=100)
    price = models.PositiveIntegerField()             # 가격 (원)
    description = models.TextField(blank=True)
    image = models.ImageField(
        upload_to="menu_images/",
        null=True,
        blank=True,
    )
    is_sold_out = models.BooleanField(default=False)  # 품절 여부
    is_active = models.BooleanField(default=True)     # 판매 중지된 메뉴 처리용
    # created_at = models.DateTimeField(auto_now_add=True)

    # 평균 평점/리뷰 수는 나중에 리뷰 앱과 연결해서 property 또는 캐시 필드로 사용할 수 있음
    # avg_rating = models.FloatField(default=0.0)
    # review_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.cafeteria.name} - {self.name}"