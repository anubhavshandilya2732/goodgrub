from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    username: str
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class Location(BaseModel):
    address: str
    city: str
    district: str
    state: str
    country: str
    
class AddLocationRequest(BaseModel):
    locations: List[Location]  # <-- change 'location' to 'locations' and make it a list

class FoodPostCreate(BaseModel):
    name: str
    type: str
    quantity: int
    freshness: str
    location: List[Location]
    datetime: datetime

class FoodPostOut(BaseModel):
    id: str
    name: str
    type: str
    quantity: int
    freshness: str
    post_status: str
    location: List[Location]
    user_id: str
    
class ClaimRequest(BaseModel):
    quantity: int