from pydantic import BaseModel, EmailStr

class User(BaseModel):
    username: str
    email: EmailStr
    password: str
    is_verified: bool = False
    otp: str | None = None