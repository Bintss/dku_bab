# /app/schemas.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

#      User
class UserBase(BaseModel):
    nickname: str = Field(..., max_length=255)

class UserCreate(UserBase):
    user_id: str = Field(..., max_length=255)
    password: str = Field(..., min_length=4)

class User(UserBase):
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

#    Restaurant
class RestaurantBase(BaseModel):
    name: str = Field(..., max_length=255)
    location: str = Field(..., max_length=255)
    operating_hours: Optional[str] = Field(None, max_length=255)

class Restaurant(RestaurantBase):
    restaurant_id: int

    class Config:
        from_attributes = True

#       Menu
class MenuBase(BaseModel):
    name: str = Field(..., max_length=255)
    price: int = Field(..., gt=0)
    image_url: Optional[str] = Field(None, max_length=255)

class Menu(MenuBase):
    menu_id: int
    restaurant_id: int

    class Config:
        from_attributes = True

#      Review
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    content: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=255)

class Review(ReviewBase):
    review_id: int
    created_at: datetime
    writer: User
    menu: Menu

    class Config:
        from_attributes = True