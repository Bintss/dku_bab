from rest_framework import serializers
from .models import Cafeteria, Menu

class CafeteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafeteria
        fields = [
            "id",
            "name",
            "description",
            "location",
            "is_active",
        ]

class MenuSerializer(serializers.ModelSerializer):
    cafeteria = CafeteriaSerializer(read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Menu
        fields = [
            "id",
            "cafeteria",
            "name",
            "price",
            "description",
            "is_sold_out",
            "is_active",
            "avg_rating",
            "review_count",
        ]
