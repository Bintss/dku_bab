from rest_framework import serializers
from .models import Cafeteria, Menu

class CafeteriaSerializer(serializers.ModelSerializer):
    avg_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    
    # 이미지는 업로드 시 필요하지만(required=False), 조회 시 URL로 나옴
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Cafeteria
        fields = [
            "id",
            "name",
            "description",
            "operating_hours",
            "location",
            "is_active",
            "avg_rating",
            "review_count",
            "image",
        ]

class MenuSerializer(serializers.ModelSerializer):
    cafeteria = CafeteriaSerializer(read_only=True)
    
    # 2. 통계 필드
    avg_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    
    # 3. 이미지 필드 (업로드 가능하도록 설정)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Menu
        fields = [
            "id",
            "cafeteria", # 조회 시에는 {id:1, name:".."} 형태로 나옴
            "name",
            "price",
            "description",
            "is_sold_out",
            "is_active",
            "avg_rating",
            "review_count",
            "image",
        ]