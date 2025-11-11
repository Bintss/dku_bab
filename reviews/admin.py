from django.contrib import admin
from .models import Restaurant, Menu, Review

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'location')

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'price') # 목록에 이름, 식당, 가격 표시
    list_filter = ('restaurant',) # 식당별로 필터링하는 기능 추가

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('menu', 'author', 'rating', 'created_at') # 목록에 메뉴, 작성자, 별점 표시
    list_filter = ('menu__restaurant', 'rating') # 식당별, 별점별 필터링 기능 추가