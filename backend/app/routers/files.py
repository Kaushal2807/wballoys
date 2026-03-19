from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.file import File
from app.dependencies.auth import get_current_user, require_role
from app.schemas.file import FileUploadResponse, FileListResponse, FileUpdateRequest
from app.utils.cloudinary import upload_file_to_cloudinary, delete_file_from_cloudinary
import os

router = APIRouter()


# ─── POST /api/files/upload (Upload file) ──
@router.post("/upload", response_model=FileUploadResponse, status_code=201)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    category: Optional[str] = Form(None),
    folder: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    current_user: User = Depends(require_role("admin", "manager")),
    db: Session = Depends(get_db),
):
    """
    Upload a file to Cloudinary and save metadata to database.
    Admin and Manager only.
    """
    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)

        # Validate file size (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        if file_size > max_size:
            raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")

        # Determine folder path
        upload_folder = f"wb_alloys/{folder}" if folder else f"wb_alloys/{category}" if category else "wb_alloys/uploads"

        # Upload to Cloudinary
        cloudinary_public_id, cloudinary_url = upload_file_to_cloudinary(
            file_content=file_content,
            original_filename=file.filename,
            folder=upload_folder
        )

        # Create database record
        db_file = File(
            user_id=current_user.id,
            filename=cloudinary_public_id.split('/')[-1],
            original_filename=file.filename,
            file_size=file_size,
            file_type=file.content_type or "application/octet-stream",
            cloudinary_public_id=cloudinary_public_id,
            cloudinary_url=cloudinary_url,
            category=category,
            folder=folder,
            description=description,
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)

        return db_file

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


# ─── POST /api/files/upload-multiple (Upload multiple files) ──
@router.post("/upload-multiple", response_model=List[FileUploadResponse], status_code=201)
async def upload_multiple_files(
    files: List[UploadFile] = FastAPIFile(...),
    category: Optional[str] = Form(None),
    folder: Optional[str] = Form(None),
    current_user: User = Depends(require_role("admin", "manager")),
    db: Session = Depends(get_db),
):
    """
    Upload multiple files to Cloudinary.
    Admin and Manager only.
    """
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files can be uploaded at once")

    uploaded_files = []

    try:
        for file in files:
            file_content = await file.read()
            file_size = len(file_content)

            # Validate file size (max 50MB per file)
            max_size = 50 * 1024 * 1024  # 50MB
            if file_size > max_size:
                raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds 50MB limit")

            # Determine folder path
            upload_folder = f"wb_alloys/{folder}" if folder else f"wb_alloys/{category}" if category else "wb_alloys/uploads"

            # Upload to Cloudinary
            cloudinary_public_id, cloudinary_url = upload_file_to_cloudinary(
                file_content=file_content,
                original_filename=file.filename,
                folder=upload_folder
            )

            # Create database record
            db_file = File(
                user_id=current_user.id,
                filename=cloudinary_public_id.split('/')[-1],
                original_filename=file.filename,
                file_size=file_size,
                file_type=file.content_type or "application/octet-stream",
                cloudinary_public_id=cloudinary_public_id,
                cloudinary_url=cloudinary_url,
                category=category,
                folder=folder,
            )
            db.add(db_file)
            uploaded_files.append(db_file)

        db.commit()
        for db_file in uploaded_files:
            db.refresh(db_file)

        return uploaded_files

    except Exception as e:
        db.rollback()
        # Clean up any files that were uploaded to Cloudinary
        for db_file in uploaded_files:
            try:
                delete_file_from_cloudinary(db_file.cloudinary_public_id)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Failed to upload files: {str(e)}")


# ─── GET /api/files (List all files for current user) ──
@router.get("/", response_model=List[FileListResponse])
def get_files(
    category: Optional[str] = None,
    folder: Optional[str] = None,
    current_user: User = Depends(require_role("admin", "manager")),
    db: Session = Depends(get_db),
):
    """
    Get all files. Admin and Manager only.
    Optionally filter by category or folder.
    """
    query = db.query(File)

    if category:
        query = query.filter(File.category == category)

    if folder:
        query = query.filter(File.folder == folder)

    files = query.order_by(File.created_at.desc()).all()
    return files


# ─── GET /api/files/{file_id} (Get file details) ──
@router.get("/{file_id}", response_model=FileListResponse)
def get_file(
    file_id: int,
    current_user: User = Depends(require_role("admin", "manager")),
    db: Session = Depends(get_db),
):
    """
    Get details of a specific file. Admin and Manager only.
    """
    file = db.query(File).filter(File.id == file_id).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    return file


# ─── PATCH /api/files/{file_id} (Update file metadata) ──
@router.patch("/{file_id}", response_model=FileListResponse)
def update_file(
    file_id: int,
    data: FileUpdateRequest,
    current_user: User = Depends(require_role("admin", "manager")),
    db: Session = Depends(get_db),
):
    """
    Update file metadata (category, folder, description). Admin and Manager only.
    """
    file = db.query(File).filter(File.id == file_id).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Update fields
    if data.category is not None:
        file.category = data.category
    if data.folder is not None:
        file.folder = data.folder
    if data.description is not None:
        file.description = data.description

    db.commit()
    db.refresh(file)
    return file


# ─── DELETE /api/files/{file_id} (Delete file) ──
@router.delete("/{file_id}", status_code=204)
def delete_file(
    file_id: int,
    current_user: User = Depends(require_role("admin", "manager")),
    db: Session = Depends(get_db),
):
    """
    Delete a file from both Cloudinary and database. Admin and Manager only.
    """
    file = db.query(File).filter(File.id == file_id).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Prevent deletion of folder marker files to preserve folder structure
    if file.original_filename == '.folder_marker':
        raise HTTPException(status_code=400, detail="Cannot delete folder marker files. Use folder deletion instead.")

    try:
        # Delete from Cloudinary
        delete_file_from_cloudinary(file.cloudinary_public_id)
    except Exception as e:
        # Log error but continue with database deletion
        print(f"Warning: Failed to delete file from Cloudinary: {str(e)}")

    # Delete from database
    db.delete(file)
    db.commit()

    return None



# ─── DELETE /api/files/folders/{folder_name} (Delete folder and all its files) ──
@router.delete("/folders/{folder_name:path}", status_code=204)
def delete_folder(
    folder_name: str,
    current_user: User = Depends(require_role("admin", "manager")),
    db: Session = Depends(get_db),
):
    """
    Delete a folder and all files within it. Admin and Manager only.
    """
    # Get all files in the folder
    files_in_folder = db.query(File).filter(File.folder == folder_name).all()

    if not files_in_folder:
        raise HTTPException(status_code=404, detail=f"Folder '{folder_name}' not found or empty")

    deleted_count = 0
    errors = []

    try:
        # Delete each file in the folder
        for file in files_in_folder:
            try:
                # Delete from Cloudinary
                delete_file_from_cloudinary(file.cloudinary_public_id)
                deleted_count += 1
            except Exception as e:
                errors.append(f"Failed to delete {file.original_filename} from Cloudinary: {str(e)}")

            # Delete from database regardless of Cloudinary result
            db.delete(file)

        db.commit()

        # Log any Cloudinary errors but consider the operation successful if DB deletion worked
        if errors:
            print(f"Warning: Some files had Cloudinary deletion errors: {errors}")

        return None

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete folder: {str(e)}")


# ─── GET /api/files/categories/list (Get unique categories) ──
@router.get("/categories/list")
def get_categories(
    current_user: User = Depends(require_role("admin", "manager")),
    db: Session = Depends(get_db),
):
    """
    Get list of unique categories. Admin and Manager only.
    """
    categories = db.query(File.category).filter(
        File.category.isnot(None)
    ).distinct().all()

    return [cat[0] for cat in categories if cat[0]]


# ─── GET /api/files/folders/list (Get unique folders) ──
@router.get("/folders/list")
def get_folders(
    current_user: User = Depends(require_role("admin", "manager")),
    db: Session = Depends(get_db),
):
    """
    Get list of unique folders. Admin and Manager only.
    Includes folders even if they only contain folder marker files.
    """
    folders = db.query(File.folder).filter(
        File.folder.isnot(None),
        File.folder != ''
    ).distinct().all()

    return [folder[0] for folder in folders if folder[0]]
