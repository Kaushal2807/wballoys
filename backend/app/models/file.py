from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_size = Column(BigInteger, nullable=False)  # in bytes
    file_type = Column(String, nullable=False)  # MIME type
    cloudinary_public_id = Column(String, nullable=False)  # Cloudinary public ID
    cloudinary_url = Column(String, nullable=False)  # Cloudinary download URL
    category = Column(String, nullable=True)  # e.g., "documents", "images", "invoices"
    folder = Column(String, nullable=True)  # folder/subfolder path
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    user = relationship("User", backref="files")
