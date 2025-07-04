import pymongo
from pymongo import MongoClient

# Use the local MongoDB connection string with the correct port from docker-compose.yml
mongodb_url = "os.environ.get('LIST_MONGODB_DATABASES_SECRET')'LIST_MONGODB_DATABASES_SECRET')'LIST_MONGODB_DATABASES_SECRET')'LIST_MONGODB_DATABASES_SECRET')"

print(f"Connecting to MongoDB using URL: {mongodb_url}")

try:
    # Connect to MongoDB
    client = MongoClient(mongodb_url)
    
    # Ping the database to verify connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB")
    
    # List all databases
    databases = client.list_database_names()
    print(f"\nFound {len(databases)} databases:")
    for db_name in databases:
        print(f"  - {db_name}")
        
        # List collections in each database
        db = client[db_name]
        collections = db.list_collection_names()
        if collections:
            print(f"    Collections in {db_name}:")
            for collection in collections:
                count = db[collection].count_documents({})
                print(f"      - {collection}: {count} documents")
        else:
            print(f"    No collections in {db_name}")
    
    print("\nMongoDB database listing completed successfully")

except Exception as e:
    print(f"Error connecting to MongoDB: {str(e)}")
    exit(1)
finally:
    # Close the MongoDB connection
    if 'client' in locals():
        client.close()
        print("\nMongoDB connection closed")