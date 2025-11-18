from django.db import models
from django.conf import settings
from cafeterias.models import Cafeteria, Menu

# # [DBA] 식당 테이블
# class Restaurant(models.Model):
#     name = models.CharField(max_length=100)
#     location = models.CharField(max_length=200, blank=True) # "고기든든"
#     operating_hours = models.CharField(max_length=100, blank=True) # "09:00 - 18:00"

#     def __str__(self):
#         return self.name

# # [DBA] 메뉴 테이블 (예: 돈까스, 제육덮밥)
# class Menu(models.Model):
#     # [DBA] ForeignKey: Restaurant(부모)가 삭제되면, 속한 Menu(자식)도 함께 삭제(models.CASCADE)
#     restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menus')
#     name = models.CharField(max_length=100)
#     price = models.IntegerField(default=0)
#     # image_url = models.URLField(blank=True) # 메뉴 이미지 URL

#     def __str__(self):
#         return f"{self.restaurant.name} - {self.name}"

# [DBA] 리뷰 테이블
class Review(models.Model):
    # [DBA] ForeignKey: Menu가 삭제되면, 리뷰도 함께 삭제(models.CASCADE)
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='reviews')
    
    # [DBA] ForeignKey: Django의 기본 User 모델과 연결.
    # 사용자가 탈퇴(User 삭제)하면, 작성한 리뷰도 함께 삭제(models.CASCADE)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    RATING_CHOICES = [
        (1, '★'),
        (2, '★★'),
        (3, '★★★'),
        (4, '★★★★'),
        (5, '★★★★★'),
    ]
    rating = models.FloatField(choices=RATING_CHOICES, default=5)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True) # [DBA] 생성 시각 자동 저장
    updated_at = models.DateTimeField(auto_now=True)     # [DBA] 수정 시각 자동 저장

    class Meta:
        unique_together = ('menu', 'author')

    def __str__(self):
        return f"{self.menu.name} - {self.rating}점 by {self.author.username}"