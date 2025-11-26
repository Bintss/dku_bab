# reviews/serializers.py
from rest_framework import serializers
from .models import Restaurant, Menu, Review

# 1. 리뷰 정보 변환기 (메뉴판에서 남들이 쓴 리뷰 볼 때 사용)
class ReviewSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username') # 작성자 이름

    class Meta:
        model = Review
        fields = ['id', 'author_name', 'rating', 'content', 'created_at']

# 2. 메뉴 정보 변환기 (리뷰들도 같이 보여줌)
class MenuSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Menu
        fields = ['id', 'name', 'price', 'reviews']

# 3. 식당 정보 변환기 (메뉴들도 같이 보여줌)
class RestaurantSerializer(serializers.ModelSerializer):
    menus = MenuSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'location', 'operating_hours', 'menus']

# 4. [내 정보 페이지용] 내가 쓴 리뷰 변환기 (어떤 식당/메뉴인지도 알려줌)
class MyReviewSerializer(serializers.ModelSerializer):
    menu_name = serializers.ReadOnlyField(source='menu.name')
    restaurant_name = serializers.ReadOnlyField(source='menu.restaurant.name')

    class Meta:
        model = Review
        fields = ['id', 'restaurant_name', 'menu_name', 'rating', 'content', 'created_at']