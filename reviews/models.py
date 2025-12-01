from django.db import models
from django.conf import settings
from cafeterias.models import Menu 

class Review(models.Model):
    # Menu 모델과 연결 (cafeterias의 Menu)
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='reviews')
    
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    RATING_CHOICES = [
        (1, '★'),
        (2, '★★'),
        (3, '★★★'),
        (4, '★★★★'),
        (5, '★★★★★'),
    ]
    rating = models.FloatField(choices=RATING_CHOICES, default=5)
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to="review_images/", null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('menu', 'author')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.menu.name} - {self.rating}점 by {self.author.username}"