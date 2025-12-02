from django.urls import path
from . import views
from .views import(
    MenuReviewListCreateAPIView, UserReviewListAPIView,
    OwnerReviewDetailAPIView, OwnerReviewListAPIView,
    MyReviewDetailAPIView
    )
app_name = "reviews"

urlpatterns = [
    # 인증 관련
    path("auth/register/", views.register_view, name="register"),
    path("auth/login/", views.login_view, name="login"),
    path("auth/logout/", views.logout_view, name="logout"),
    path("auth/me/", views.me_view, name="me"),
    path(
    "reviews/<int:pk>/",
    MyReviewDetailAPIView.as_view(),
    name="my-review-detail",
    ),

    # 일반 사용자용 리뷰 API
    path(
        "menus/<int:menu_id>/reviews/",
        MenuReviewListCreateAPIView.as_view(),
        name="menu-review-list",
    ),
    path(
        "reviews/my/",
        UserReviewListAPIView.as_view(),
        name="my-reviews",
    ),

    # 식당 주인용 리뷰 API
    path(
        "owner/reviews/",
        OwnerReviewListAPIView.as_view(),
        name="owner-review-list",
    ),
    path(
        "owner/reviews/<int:pk>/",
        OwnerReviewDetailAPIView.as_view(),
        name="owner-review-detail",
    ),
]
