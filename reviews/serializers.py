from rest_framework import serializers
from cafeterias.models import Cafeteria, Menu
from .models import Review

class CafeteriaSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafeteria
        fields = [
            "id",
            "name",
            "location",
        ]

class MenuSimpleSerializer(serializers.ModelSerializer):
    cafeteria = CafeteriaSimpleSerializer(read_only=True)

    class Meta:
        model = Menu
        fields = [
            "id",
            "name",
            "price",
            "cafeteria",
        ]

class ReviewSerializer(serializers.ModelSerializer):
    menu = MenuSimpleSerializer(read_only=True)
    menu_id = serializers.PrimaryKeyRelatedField(
        source="menu",
        queryset=Menu.objects.all(),
        write_only=True,
        required=False,
    )

    author_username = serializers.CharField(
        source="author.username",
        read_only=True
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "menu",           # 응답용: 메뉴 + 식당 풀 정보
            "menu_id",        # 요청용: 숫자 id만
            "rating",
            "content",
            "image",
            "author_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "author_username",
            "created_at",
            "updated_at",
        ]