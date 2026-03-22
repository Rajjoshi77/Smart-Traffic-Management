import sys
import os
from pymongo import MongoClient

# Add parent dir to path to import backend.config
sys.path.append(os.getcwd())
from backend.config import config

def check_data():
    print(f"Checking MongoDB at: {config.MONGO_URI}")
    print(f"Database: {config.DB_NAME}")
    
    try:
        client = MongoClient(config.MONGO_URI)
        db = client[config.DB_NAME]
        
        count = db.live_traffic.count_documents({})
        print(f"Total documents in 'live_traffic': {count}")
        
        if count > 0:
            latest = list(db.live_traffic.find().sort("timestamp", -1).limit(1))
            print("Latest document:")
            print(latest[0])
        else:
            print("⚠️ Collection is empty!")
            
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")

if __name__ == "__main__":
    check_data()
