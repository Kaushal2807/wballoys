from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # customer, engineer, manager, admin
    auth_provider = Column(String, nullable=False, server_default="local")  # local, google
    created_at = Column(DateTime(timezone=True), server_default=func.now())
