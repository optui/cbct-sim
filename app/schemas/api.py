from pydantic import BaseModel


class MessageResponse(BaseModel):
    detail: str
