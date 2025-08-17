from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
db = client.food_redistribution
user_collection = db.users
location_collection = db.locations
food_collection = db.food_post


## Below code are for testing proper connection to database.##
# async def new_user(user):
#     result = await user_collection.insert_one(user)
#     print("Inserted document with ID:", result.inserted_id)

# if __name__ == "__main__":
#     asyncio.run(new_user({"name": "Vintage", "age": 100}))
