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
        ]
