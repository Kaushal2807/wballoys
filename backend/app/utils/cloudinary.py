import cloudinary
import cloudinary.uploader
from app.config import settings
from typing import Tuple
import io

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)


def upload_file_to_cloudinary(
    file_content: bytes,
    original_filename: str,
    folder: str = "wb_alloys/uploads"
) -> Tuple[str, str]:
    """
    Upload a file to Cloudinary.

    Args:
        file_content: Binary content of the file
        original_filename: Original name of the file
        folder: Folder path in Cloudinary (default: "wb_alloys/uploads")

    Returns:
        Tuple of (public_id, secure_url)
    """
    try:
        # Upload file to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file_content,
            folder=folder,
            resource_type="auto",  # Automatically detect file type
            use_filename=True,
            unique_filename=True,
            filename_override=original_filename
        )

        public_id = upload_result.get("public_id")
        secure_url = upload_result.get("secure_url")

        return (public_id, secure_url)

    except Exception as e:
        raise Exception(f"Failed to upload file to Cloudinary: {str(e)}")


def delete_file_from_cloudinary(public_id: str) -> None:
    """
    Delete a file from Cloudinary.

    Args:
        public_id: The Cloudinary public ID of the file to delete
    """
    try:
        # Delete file from Cloudinary
        result = cloudinary.uploader.destroy(public_id)

        # Cloudinary returns {"result": "ok"} on success
        if result.get("result") != "ok":
            raise Exception(f"Cloudinary deletion failed: {result}")

    except Exception as e:
        raise Exception(f"Failed to delete file from Cloudinary: {str(e)}")
