from django.urls import path
from .views import (
    CafeteriaListAPIView, CafeteriaMenuListAPIView, CafeteriaDetailAPIView, 
    MenuSearchAPIView, PopularMenuListAPIView,
    )

urlpatterns = [
    path("cafeterias/", CafeteriaListAPIView.as_view(), name="cafeteria-list"),
    path(
        "cafeterias/<int:cafeteria_id>/menus/",
        CafeteriaMenuListAPIView.as_view(),
        name="cafeteria-menu-list"
    ),
    path("cafeterias/<int:pk>/", CafeteriaDetailAPIView.as_view(), name="cafeteria-detail"),
    path("menus/search/", MenuSearchAPIView.as_view(), name="menu-search"),
    path("menus/popular/", PopularMenuListAPIView.as_view(), name="menu-popular"),
]