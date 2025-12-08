from django.contrib import admin
from .models import Cafeteria, Menu

# Register your models here.
@admin.register(Cafeteria)
class CafeteriasAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "description", "location", "is_active")
    list_filter = ("is_active", "owner")
    search_fields = ("name", "location", "owner__username", "owner__email")
    ordering = ("name",)

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "cafeteria", "price", "is_sold_out", "is_active")
    list_filter = ("cafeteria", "is_sold_out", "is_active")
    search_fields = ("name", "cafeteria__name")
    ordering = ("cafeteria", "name")