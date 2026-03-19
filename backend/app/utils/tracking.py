"""
Tracking ID generation utility for product order tracking.
Provides secure, unique tracking IDs for customer order tracking.
"""
import uuid
from sqlalchemy.orm import Session


def generate_tracking_id(db: Session) -> str:
    """
    Generate a unique, secure tracking ID for customer use.

    Format: TRK-XXXXXX (TRK- prefix + 6 character hex)
    - 6 hex characters provide 24 bits of randomness (over 16 million combinations)
    - Sufficiently random to prevent enumeration attacks
    - Readable and type-able for customers

    Args:
        db: Database session to check for uniqueness

    Returns:
        str: Unique tracking ID in format TRK-XXXXXX

    Example:
        >>> tracking_id = generate_tracking_id(db)
        >>> print(tracking_id)
        TRK-A1B2C3
    """
    # Import here to avoid circular imports
    from app.models.service_request import ProductOrder

    while True:
        # Use UUID4 for cryptographically secure random generation
        tracking_id = f"TRK-{uuid.uuid4().hex[:6].upper()}"

        # Ensure uniqueness in database
        existing = db.query(ProductOrder).filter(ProductOrder.tracking_id == tracking_id).first()
        if not existing:
            return tracking_id


def generate_tracking_password() -> str:
    """
    Generate a secure tracking password for customer order tracking.

    Format: 8-character alphanumeric string (uppercase)
    - Easy to communicate over phone or email
    - Sufficient randomness for security

    Returns:
        str: 8-character tracking password

    Example:
        >>> password = generate_tracking_password()
        >>> print(password)
        A7B3C9D2
    """
    # Generate 8 random hex characters for the password
    return uuid.uuid4().hex[:8].upper()


def validate_tracking_id(tracking_id: str) -> bool:
    """
    Validate tracking ID format.

    Args:
        tracking_id: The tracking ID to validate

    Returns:
        bool: True if valid format, False otherwise

    Example:
        >>> validate_tracking_id("TRK-A1B2C3")
        True
        >>> validate_tracking_id("invalid")
        False
    """
    import re
    pattern = r'^TRK-[A-F0-9]{6}$'
    return bool(re.match(pattern, tracking_id.upper()))