from django.urls import path
from .views import MenuReviewListCreateAPIView

urlpatterns = [
    path(
        "menus/<int:menu_id>/reviews/",
        MenuReviewListCreateAPIView.as_view(),
        name="menu-review-list-create",
    ),
]