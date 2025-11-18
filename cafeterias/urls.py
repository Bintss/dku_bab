from django.urls import path
from .views import CafeteriaListAPIView, CafeteriaMenuListAPIView

urlpatterns = [
    path("cafeterias/", CafeteriaListAPIView.as_view(), name="cafeteria-list"),
    path(
        "cafeterias/<int:cafeteria_id>/menus/",
        CafeteriaMenuListAPIView.as_view(),
        name="cafeteria-menu-list"
    ),
]