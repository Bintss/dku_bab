from rest_framework import serializers
from .models import Notice


class NoticeSerializer(serializers.ModelSerializer):
    # author는 username만 문자열로 내려주고, 쓰기는 막아둠
    author = serializers.CharField(
        source="author.username",
        read_only=True,
    )

    class Meta:
        model = Notice
        fields = [
            "id",
            "title",
            "content",
            "author",
            "is_pinned",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "author",
            "created_at",
            "updated_at",
        ]