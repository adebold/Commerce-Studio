import os
import pymongo
from pymongo import MongoClient
import sys
import time
import json
from bson import json_util

def connect_to_source():
    """Connect to the source MongoDB (local)."""
    print("Connecting to source MongoDB (local)...")
    
    # Source MongoDB connection string
    source_url = "mongodb://localhost:27018"
    source_db_name = "eyewear_database"
    
    try:
        # Connect to MongoDB
        source_client = MongoClient(source_url, serverSelectionTimeoutMS=5000)
        
        # Ping the database to verify connection
        source_client.admin.command('ping')
        print("✅ Successfully connected to source MongoDB")
        
        # Get the source database
        source_db = source_client[source_db_name]
        
        return source_client, source_db
    except Exception as e:
        print(f"❌ Error connecting to source MongoDB: {str(e)}")
        sys.exit(1)

def connect_to_target():
    """Connect to the target MongoDB (Atlas)."""
    print("\nConnecting to target MongoDB (Atlas)...")
    
    # Target MongoDB connection string
    username = os.environ.get('MONGODB_ATLAS_USERNAME', 'eyewear')
    password = os.environ.get('MONGODB_ATLAS_PASSWORD', '')
    cluster_name = "cluster0.kqhnm.mongodb.net"
    target_db_name = "eyewear"
    
    # Construct the connection string
    target_url = f"mongodb+srv://{username}:{password}@{cluster_name}/{target_db_name}?retryWrites=true&w=majority"
    
    try:
        # Connect to MongoDB
        target_client = MongoClient(target_url, serverSelectionTimeoutMS=5000)
        
        # Ping the database to verify connection
        target_client.admin.command('ping')
        print("✅ Successfully connected to target MongoDB (Atlas)")
        
        # Get the target database
        target_db = target_client[target_db_name]
        
        return target_client, target_db
    except Exception as e:
        print(f"❌ Error connecting to target MongoDB (Atlas): {str(e)}")
        sys.exit(1)

def migrate_collection(source_db, target_db, collection_name):
    """Migrate a collection from source to target."""
    print(f"\nMigrating collection: {collection_name}")
    
    # Get the source collection
    source_collection = source_db[collection_name]
    
    # Get the target collection
    target_collection = target_db[collection_name]
    
    # Get the documents from the source collection
    documents = list(source_collection.find())
    
    if not documents:
        print(f"⚠️ No documents found in source collection: {collection_name}")
        return 0
    
    # Insert the documents into the target collection
    if len(documents) > 0:
        # Clear the target collection first
        target_collection.delete_many({})
        
        # Insert the documents
        result = target_collection.insert_many(documents)
        
        print(f"✅ Successfully migrated {len(result.inserted_ids)} documents to {collection_name}")
        return len(result.inserted_ids)
    else:
        print(f"⚠️ No documents to migrate for collection: {collection_name}")
        return 0

def main():
    print("MongoDB Migration Tool")
    print("=====================")
    
    # Connect to source and target databases
    source_client, source_db = connect_to_source()
    target_client, target_db = connect_to_target()
    
    # Get the collections from the source database
    collections = source_db.list_collection_names()
    
    if not collections:
        print("⚠️ No collections found in source database")
        return
    
    print(f"\nFound {len(collections)} collections in source database:")
    for collection in collections:
        print(f"  - {collection}")
    
    # Migrate each collection
    total_documents = 0
    for collection in collections:
        documents_migrated = migrate_collection(source_db, target_db, collection)
        total_documents += documents_migrated
    
    # Create a migration log
    migration_log = {
        "timestamp": time.time(),
        "source_database": source_db.name,
        "target_database": target_db.name,
        "collections_migrated": len(collections),
        "total_documents_migrated": total_documents,
        "status": "success"
    }
    
    # Save the migration log to the target database
    target_db["migration_logs"].insert_one(migration_log)
    
    print("\nMigration Summary")
    print("================")
    print(f"Source Database: {source_db.name}")
    print(f"Target Database: {target_db.name}")
    print(f"Collections Migrated: {len(collections)}")
    print(f"Total Documents Migrated: {total_documents}")
    print("\n✅ Migration completed successfully")
    
    # Close the connections
    source_client.close()
    target_client.close()
    print("\nConnections closed")

if __name__ == "__main__":
    main()