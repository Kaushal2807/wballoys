from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_name = Column(String, nullable=False)
    model = Column(String, nullable=False)
    serial_number = Column(String, nullable=False)
    location = Column(String, nullable=False)

    customer = relationship("User")


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    description = Column(String, nullable=False)
    urgency = Column(String, nullable=False)  # low, medium, high
    preferred_date = Column(String, nullable=False)
    preferred_time = Column(String, nullable=False)
    status = Column(String, default="new", nullable=False)
    delivery_status = Column(String, default="site_visited", nullable=False)
    rejected_by_engineers = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    customer = relationship("User", foreign_keys=[customer_id])
    asset = relationship("Asset")
    assignment = relationship(
        "JobAssignment",
        back_populates="request",
        uselist=False,
        primaryjoin="and_(ServiceRequest.id==JobAssignment.request_id, JobAssignment.status!='rejected')",
    )
    delivery_updates = relationship(
        "DeliveryUpdate",
        back_populates="request",
        order_by="DeliveryUpdate.updated_at.desc()",
    )


class JobAssignment(Base):
    __tablename__ = "job_assignments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    engineer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="pending", nullable=False)  # pending, accepted, rejected

    request = relationship("ServiceRequest", back_populates="assignment")
    engineer = relationship("User", foreign_keys=[engineer_id])
    assigner = relationship("User", foreign_keys=[assigned_by])


class JobUpdate(Base):
    __tablename__ = "job_updates"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class JobPhoto(Base):
    __tablename__ = "job_photos"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    photo_url = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader = relationship("User")


class DeliveryUpdate(Base):
    __tablename__ = "delivery_updates"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    status = Column(String, nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    request = relationship("ServiceRequest", back_populates="delivery_updates")
    user = relationship("User")


class ProductOrder(Base):
    __tablename__ = "product_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False)
    product_name = Column(String, nullable=False)
    model = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False, index=True)
    tracking_id = Column(String, unique=True, index=True, nullable=False)
    delivery_address = Column(String, nullable=False)
    order_date = Column(String, nullable=False)
    expected_delivery_date = Column(String, nullable=False)
    delivery_status = Column(String, default="pending", nullable=False)
    notes = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    creator = relationship("User")
