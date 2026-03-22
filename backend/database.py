from motor.motor_asyncio import AsyncIOMotorClient
from config import config

class Database:
    client: AsyncIOMotorClient = None

    async def connect(self):
        self.client = AsyncIOMotorClient(config.MONGO_URI)
        print(f"Connected to MongoDB at {config.MONGO_URI}")

    async def close(self):
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")

    def get_db(self):
        return self.client[config.DB_NAME]

db = Database()

async def get_database():
    return db.get_db()
