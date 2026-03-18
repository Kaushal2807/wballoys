from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str  # customer, engineer, manager, admin


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class UserRoleUpdate(BaseModel):
    role: str  # customer, engineer, manager, admin
