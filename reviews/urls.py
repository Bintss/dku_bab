from django.urls import path
from . import views

urlpatterns = [
    path("auth/register/", views.register_view, name="auth_register"),
    path("auth/login/", views.login_view, name="auth_login"),
    path("auth/logout/", views.logout_view, name="auth_logout"),
    path("auth/me/", views.me_view, name="auth_me"),
]
