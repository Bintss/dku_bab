from rest_framework import generics
from cafeterias.models import Menu
from .models import Review
from .serializers import ReviewSerializer


class MenuReviewListCreateAPIView(generics.ListCreateAPIView):
    """
    특정 메뉴에 대한 리뷰 목록 조회 + 리뷰 작성

    GET /api/menus/<menu_id>/reviews/
    POST /api/menus/<menu_id>/reviews/
    """
    serializer_class = ReviewSerializer

    def get_queryset(self):
        # URL에서 menu_id 가져오기
        menu_id = self.kwargs["menu_id"]
        qs =  Review.objects.filter(menu_id=menu_id)

        # 쿼리 파라미터에서 order_by 값 읽기 (예: ?order_by=rating)
        order_by = self.request.query_params.get("order_by")

        if order_by == "rating":
            # 별점 높은 순, 같은 별점이면 최신순
            qs = qs.order_by("-rating", "-created_at")
        else:
            # 기본: 최신순
            qs = qs.order_by("-created_at")

        return qs

    def perform_create(self, serializer):
        """
        POST 요청으로 리뷰 저장할 때,
        - URL의 menu_id로 Menu 객체 찾고
        - author는 요청한 사용자(request.user)로 설정
        """
        menu_id = self.kwargs["menu_id"]
        menu = Menu.objects.get(pk=menu_id)

        serializer.save(
            menu=menu,
            author=self.request.user,  # 로그인한 유저 기준
        )