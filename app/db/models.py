# /app/db/models.py

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    TIMESTAMP,
    ForeignKey,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .session import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(String(255), primary_key=True)
    password = Column(String(255), nullable=False)
    nickname = Column(String(255), nullable=False, unique=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    # User <-> Review (1:N)
    reviews = relationship("Review", back_populates="writer")


class Restaurant(Base):
    __tablename__ = "restaurants"

    restaurant_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    operating_hours = Column(String(255), nullable=True)

    # Restaurant <-> Menu (1:N)
    menus = relationship("Menu", back_populates="restaurant", cascade="all, delete-orphan")


class Menu(Base):
    __tablename__ = "menus"

    menu_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    price = Column(Integer, nullable=False)
    image_url = Column(String(255), nullable=True)

    # Menu <-> Restaurant (N:1)
    restaurant_id = Column(Integer, ForeignKey("restaurants.restaurant_id", ondelete="CASCADE"), nullable=False)
    restaurant = relationship("Restaurant", back_populates="menus")

    # Menu <-> Review (1:N)
    reviews = relationship("Review", back_populates="menu", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    __table_args__ = (CheckConstraint("rating >= 1 AND rating <= 5", name="rating_check"),)

    review_id = Column(Integer, primary_key=True, autoincrement=True)
    rating = Column(Integer, nullable=False)
    content = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    # Review <-> User (N:1)
    user_id = Column(String(255), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    writer = relationship("User", back_populates="reviews")

    # Review <-> Menu (N:1)
    menu_id = Column(Integer, ForeignKey("menus.menu_id", ondelete="CASCADE"), nullable=False)
    menu = relationship("Menu", back_populates="reviews")