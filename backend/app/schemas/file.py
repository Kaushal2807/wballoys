from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FileUploadResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    file_type: str
    cloudinary_public_id: str
    cloudinary_url: str
    category: Optional[str]
    folder: Optional[str]
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class FileListResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    file_type: str
    cloudinary_public_id: str
    cloudinary_url: str
    category: Optional[str]
    folder: Optional[str]
    description: Optional[str]
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True


class FileUpdateRequest(BaseModel):
    category: Optional[str] = None
    folder: Optional[str] = None
    description: Optional[str] = None
