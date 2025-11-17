from django.db import models


class Campus(models.Model):
    """캠퍼스 정보 (죽전 / 천안 등)"""
    name = models.CharField(max_length=50)            # 예: 죽전, 천안
    code = models.CharField(max_length=20, unique=True)  # 예: JUKJEON, CHEONAN

    def __str__(self):
        return self.name


class Cafeteria(models.Model):
    """식당 정보 (학생식당, 교직원식당 등)"""
    campus = models.ForeignKey(
        Campus,
        on_delete=models.CASCADE,
        related_name="cafeterias",
    )
    name = models.CharField(max_length=100)           # 식당 이름
    description = models.CharField(max_length=255, blank=True)  # 간단 설명
    location = models.CharField(max_length=200, blank=True)     # 건물/층 정보
    open_time = models.TimeField(null=True, blank=True)
    close_time = models.TimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)     # 운영 중인지 여부

    def __str__(self):
        return f"{self.campus.name} - {self.name}"


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
    image = models.CharField(max_length=255, blank=True, null=True)  # 임시
    is_sold_out = models.BooleanField(default=False)  # 품절 여부
    is_active = models.BooleanField(default=True)     # 판매 중지된 메뉴 처리용
    created_at = models.DateTimeField(auto_now_add=True)

    # 평균 평점/리뷰 수는 나중에 리뷰 앱과 연결해서 property 또는 캐시 필드로 사용할 수 있음
    # avg_rating = models.FloatField(default=0.0)
    # review_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.cafeteria.name} - {self.name}"