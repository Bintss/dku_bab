from django.urls import path
from . import views
from .views import MenuReviewListCreateAPIView, UserReviewListAPIView

urlpatterns = [
    path("auth/register/", views.register_view, name="auth_register"),
    path("auth/login/", views.login_view, name="auth_login"),
    path("auth/logout/", views.logout_view, name="auth_logout"),
    path("auth/me/", views.me_view, name="auth_me"),
]
from django.urls import path
from .views import MenuReviewListCreateAPIView

app_name = "reviews"

urlpatterns = [
    path("auth/register/", views.register_view, name="register"),
    path("auth/login/", views.login_view, name="login"),
    path("auth/logout/", views.logout_view, name="logout"),
    path("auth/me/", views.me_view, name="me"),

    path("menus/<int:menu_id>/reviews/", MenuReviewListCreateAPIView.as_view(), name="menu-review-list"),
    
    path("reviews/my/", UserReviewListAPIView.as_view(), name="my-reviews"),
]
