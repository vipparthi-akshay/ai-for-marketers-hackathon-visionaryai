from pydantic import BaseModel, Field


class SuccessResponse(BaseModel):
    success: bool = True
    message: str = "Operation successful"
    data: dict | list | None = None


class PaginatedResponse(BaseModel):
    success: bool = True
    data: list = []
    total: int = 0
    page: int = 1
    page_size: int = 20
    total_pages: int = 1


class ErrorResponse(BaseModel):
    success: bool = False
    error: dict
    request_id: str | None = None
