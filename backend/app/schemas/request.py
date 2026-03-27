from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RequestCreate(BaseModel):
    asset_id: int
    description: str
    urgency: str  # low, medium, high
    preferred_date: str
    preferred_time: str


class AssignmentCreate(BaseModel):
    request_id: int
    engineer_id: int
    note: Optional[str] = ""


class DeliveryStatusUpdate(BaseModel):
    status: str  # photos_taken, next_date_given, service_solved
    notes: Optional[str] = None


class JobUpdateCreate(BaseModel):
    notes: str


class SafetyChecklistItemCreate(BaseModel):
    safety_parameter_id: int
    notes: Optional[str] = None


class SafetyPhotoUpload(BaseModel):
    photo_url: Optional[str] = None
    safety_category: str
    safety_notes: Optional[str] = None


class SafetyWorkStartRequest(BaseModel):
    checklist_items: List[SafetyChecklistItemCreate]
    photos: List[SafetyPhotoUpload]
    notes: Optional[str] = None
