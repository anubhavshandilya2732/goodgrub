import random
from fastapi import FastAPI, HTTPException, Depends, Body, WebSocket, WebSocketDisconnect
from .schemas import UserCreate, UserLogin, Token, UserOut, FoodPostCreate, FoodPostOut, AddLocationRequest, ClaimRequest
from .database import user_collection, food_collection, location_collection    
from .auth import hash_password, verify_password, create_access_token, get_current_user
from fastapi.middleware.cors import CORSMiddleware
import smtplib
from bson import ObjectId
from dotenv import load_dotenv
from datetime import datetime
import os
from typing import List
from fastapi import APIRouter

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.29.22:5173/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        print(f"Broadcasting to {len(self.active_connections)} clients: {message}")
        to_remove = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                to_remove.append(connection)
        for conn in to_remove:
            self.disconnect(conn)

manager = ConnectionManager()

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(email, otp):
    sender = os.getenv("EMAIL_HOST_USER")
    password = os.getenv("EMAIL_HOST_PASSWORD")
    message = f"Subject: OTP Verification\n\nYour OTP for Good Gurb is: {otp}"
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, email, message)

@app.post("/register")
async def register(user: UserCreate):
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_pw = hash_password(user.password)
    otp = generate_otp()
    user_dict = user.model_dump()
    user_dict["password"] = hashed_pw
    user_dict["is_verified"] = False
    user_dict["otp"] = otp
    result = await user_collection.insert_one(user_dict)
    send_otp_email(user.email, otp)
    
    return {"id": str(result.inserted_id), "username": user.username}

@app.post("/login")
async def login(user: UserLogin):
    db_user = await user_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not db_user.get("is_verified"):
        raise HTTPException(status_code=403, detail="Email not verified")

    access_token = create_access_token({"sub": db_user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserOut)
async def get_me(current_user: UserOut = Depends(get_current_user)):
    return current_user

@app.get("/user/profile")
async def user_profile(current_user: UserOut = Depends(get_current_user)):
    # Get user info
    user = await user_collection.find_one({"email": current_user.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Get donation stats
    food_posts = await food_collection.find({"user_id": current_user.id}).to_list(length=1000)
    donation_count = len(food_posts)
    total_quantity = sum(fp.get("quantity", 0) for fp in food_posts)
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "donation_count": donation_count,
        "total_quantity": total_quantity,
        "food_posts": [{"id": str(fp["_id"]), "name": fp["name"], "quantity": fp["quantity"]} for fp in food_posts]
    }

@app.post("/verify-otp")
async def verify_otp(email: str = Body(...), otp: str = Body(...)):
    user = await user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("otp") != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    await user_collection.update_one({"email": email}, {"$set": {"is_verified": True, "otp": None}})
    return {"msg": "Email verified successfully"}


# Food Posts
@app.post("/food_post", response_model=FoodPostOut)
async def create_food_post(
    food: FoodPostCreate,
    current_user: UserOut = Depends(get_current_user)
):
    food_dict = food.model_dump()
    food_dict["user_id"] = current_user.id
    food_dict["post_status"] = "available"
    result = await food_collection.insert_one(food_dict)
    return FoodPostOut(id=str(result.inserted_id), **food_dict)

@app.get("/food_posts/{city}", response_model=list[FoodPostOut])
async def get_food_posts(city: str):
    posts = []
    cursor = food_collection.find({
        "location.0.city": city.lower(),   # match first location’s city
        "post_status": "available"
    })
    async for post in cursor:
        post['id'] = str(post["_id"])
        del post["_id"]                # remove Mongo ObjectId
        posts.append(FoodPostOut(**post))
    return posts

@app.websocket("/ws/active-donation")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/claim_food/{post_id}")
async def claim_food(post_id: str, req: ClaimRequest):
    post = await food_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["quantity"] < req.quantity:
        raise HTTPException(status_code=400, detail="Not enough quantity")

    new_quantity = post["quantity"] - req.quantity
    new_status = "available" if new_quantity > 0 else "claimed"

    await food_collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"quantity": new_quantity, "post_status": new_status}}
    )

    # Broadcast update to all websocket clients
    await manager.broadcast({
        "id": str(post_id),
        "quantity": new_quantity,
        "post_status": new_status
    })

    return {"msg": "Food claimed successfully", "remaining": new_quantity}

@app.post("/add_location")
async def add_location(
    req: AddLocationRequest,
    current_user: UserOut = Depends(get_current_user)
):
    # Check if user already has location entry
    existing = await location_collection.find_one({"user_id": current_user.id})

    if existing:
        # Append new locations to existing ones
        await location_collection.update_one(
            {"user_id": current_user.id},
            {"$push": {"location": {"$each": [loc.model_dump() for loc in req.locations]}}}
        )
    else:
        # Create new entry for this user
        await location_collection.insert_one({
            "user_id": current_user.id,
            "location": [loc.model_dump() for loc in req.locations]  # <-- Convert to dicts
        })
    
    return {"msg": "Location(s) added successfully"}