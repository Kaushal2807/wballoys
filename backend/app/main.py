import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, requests, assignments, delivery, dashboard, product_orders, users, assets
from app.database import engine, Base

# Import all models so they are registered with Base.metadata
from app.models import (  # noqa: F401
    User, Asset, ServiceRequest, JobAssignment,
    JobUpdate, JobPhoto, DeliveryUpdate, ProductOrder,
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="WB Alloys Service Management API", version="1.0.0")

# CORS middleware
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
# Add frontend URL from environment if set (e.g. Vercel deployment)
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(requests.router, prefix="/api/requests", tags=["Service Requests"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])
app.include_router(delivery.router, prefix="/api/requests", tags=["Delivery"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(product_orders.router, prefix="/api/product-orders", tags=["Product Orders"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])


@app.get("/")
def root():
    return {"message": "WB Alloys Service Management API"}
