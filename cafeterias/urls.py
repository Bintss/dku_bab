from django.urls import path
from .views import CafeteriaListAPIView, CafeteriaMenuListAPIView, MenuSearchAPIView

urlpatterns = [
    path("cafeterias/", CafeteriaListAPIView.as_view(), name="cafeteria-list"),
    path(
        "cafeterias/<int:cafeteria_id>/menus/",
        CafeteriaMenuListAPIView.as_view(),
        name="cafeteria-menu-list"
    ),
    path("menus/search/", MenuSearchAPIView.as_view(), name="menu-search"),
]