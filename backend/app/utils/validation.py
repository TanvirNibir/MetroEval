"""Validation utility functions"""
from typing import Optional, Dict, Any
from app.exceptions.api_exceptions import ValidationError


def validate_required_fields(data: Dict[str, Any], required_fields: list) -> None:
    """Validate that required fields are present in data dict"""
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        raise ValidationError(
            f"Missing required fields: {', '.join(missing)}",
            errors={field: f"{field} is required" for field in missing}
        )


def validate_email(email: str) -> bool:
    """Validate email format"""
    if not email or '@' not in email:
        return False
    return True


def validate_string_length(value: str, min_length: int = 1, max_length: Optional[int] = None) -> bool:
    """Validate string length"""
    if not isinstance(value, str):
        return False
    if len(value.strip()) < min_length:
        return False
    if max_length and len(value) > max_length:
        return False
    return True

