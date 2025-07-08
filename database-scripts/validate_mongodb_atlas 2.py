import os
import pymongo
from pymongo import MongoClient
import json
from bson import json_util
import sys
from urllib.parse import quote_plus

# MongoDB Atlas connection string with API key credentials
public_key = os.environ.get('MONGODB_ATLAS_PUBLIC_KEY', '')
private_key = os.environ.get('MONGODB_ATLAS_PRIVATE_KEY', '')
mongodb_url = f"mongodb+srv://{quote_plus(public_key)}:{quote_plus(private_key)}@cluster0.kqhnm.mongodb.net/?retryWrites=true&w=majority&authMechanism=MONGODB-AWS&authSource=$external"

# Database name
db_name = "eyewear_ml"

print(f"Connecting to MongoDB Atlas using API key...")
print(f"Using connection string: {mongodb_url.replace(private_key, '********')}")
print(f"Using database: {db_name}")

try:
    # Connect to MongoDB
    client = MongoClient(mongodb_url)
    
    # Ping the database to verify connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB Atlas")
    
    # List all databases
    databases = client.list_database_names()
    print(f"\nAvailable databases: {', '.join(databases)}")
    
    # Check if the database exists
    if db_name not in databases:
        print(f"Warning: Database '{db_name}' not found. Available databases: {', '.join(databases)}")
        
        # Use the first available database if eyewear_ml doesn't exist
        if databases:
            db_name = databases[0]
            print(f"Using first available database: {db_name}")
    
    # Use the specified database
    db = client[db_name]
    
    # Get list of collections
    collections = db.list_collection_names()
    print(f"\nFound {len(collections)} collections in database '{db_name}':")
    for collection in collections:
        print(f"  - {collection}")
    
    # Get document counts for each collection
    print("\nDocument counts:")
    for collection in collections:
        count = db[collection].count_documents({})
        print(f"  - {collection}: {count} documents")
    
    # Sample data from each collection
    print("\nSample data from each collection:")
    for collection in collections:
        if db[collection].count_documents({}) > 0:
            print(f"\n  Collection: {collection}")
            sample = list(db[collection].find().limit(1))
            if sample:
                # Convert to JSON string with proper handling of MongoDB types
                sample_json = json.loads(json_util.dumps(sample[0]))
                # Print the keys in the document
                print(f"    Keys: {list(sample_json.keys())}")
                # Print a few key-value pairs if available
                for key, value in list(sample_json.items())[:5]:
                    # Truncate long values
                    if isinstance(value, str) and len(value) > 50:
                        value = value[:50] + "..."
                    elif isinstance(value, dict):
                        value = "{...}"
                    elif isinstance(value, list) and len(value) > 3:
                        value = f"[{len(value)} items]"
                    print(f"    {key}: {value}")
    
    # Check for Apify-related collections or data
    apify_collections = [c for c in collections if 'apify' in c.lower()]
    if apify_collections:
        print("\nFound Apify-related collections:")
        for collection in apify_collections:
            count = db[collection].count_documents({})
            print(f"  - {collection}: {count} documents")
    
    # Look for products collection which might contain imported eyewear data
    if 'products' in collections:
        products_count = db['products'].count_documents({})
        print(f"\nFound 'products' collection with {products_count} documents")
        
        # Check for documents with Apify-related fields
        apify_products = db['products'].count_documents({"source": "apify"})
        print(f"  - Products with source='apify': {apify_products}")
        
        # Get distribution of brands to validate data diversity
        if products_count > 0:
            print("\nBrand distribution in products:")
            pipeline = [
                {"$group": {"_id": "$brand", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            brand_counts = list(db['products'].aggregate(pipeline))
            for brand in brand_counts:
                print(f"  - {brand['_id']}: {brand['count']} products")
    
    # Check for frames collection which might contain frame data
    if 'frames' in collections:
        frames_count = db['frames'].count_documents({})
        print(f"\nFound 'frames' collection with {frames_count} documents")
        
        # Get distribution of frame shapes to validate data diversity
        if frames_count > 0:
            print("\nFrame shape distribution:")
            pipeline = [
                {"$group": {"_id": "$frameShape", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            shape_counts = list(db['frames'].aggregate(pipeline))
            for shape in shape_counts:
                print(f"  - {shape['_id']}: {shape['count']} frames")
    
    # Check for images collection which might contain image data
    if 'images' in collections:
        images_count = db['images'].count_documents({})
        print(f"\nFound 'images' collection with {images_count} documents")
        
        # Get distribution of image types to validate data diversity
        if images_count > 0:
            print("\nImage type distribution:")
            pipeline = [
                {"$group": {"_id": "$type", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            type_counts = list(db['images'].aggregate(pipeline))
            for type_info in type_counts:
                print(f"  - {type_info['_id']}: {type_info['count']} images")
    
    # Check for import logs or metadata
    if 'import_logs' in collections:
        logs_count = db['import_logs'].count_documents({})
        print(f"\nFound 'import_logs' collection with {logs_count} documents")
        
        # Get the most recent import logs
        if logs_count > 0:
            print("\nMost recent import logs:")
            recent_logs = list(db['import_logs'].find().sort("timestamp", pymongo.DESCENDING).limit(3))
            for log in recent_logs:
                log_json = json.loads(json_util.dumps(log))
                print(f"  - {log_json.get('timestamp')}: {log_json.get('status')} - {log_json.get('message', '')[:50]}")
    
    # Check for measurements collection
    if 'measurements' in collections:
        measurements_count = db['measurements'].count_documents({})
        print(f"\nFound 'measurements' collection with {measurements_count} documents")
        
        # Get distribution of measurement types
        if measurements_count > 0:
            print("\nMeasurement types distribution:")
            pipeline = [
                {"$group": {"_id": "$type", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            type_counts = list(db['measurements'].aggregate(pipeline))
            for type_info in type_counts:
                print(f"  - {type_info['_id']}: {type_info['count']} measurements")
    
    print("\nMongoDB Atlas validation completed successfully")

except Exception as e:
    print(f"Error connecting to MongoDB Atlas: {str(e)}")
    sys.exit(1)
finally:
    # Close the MongoDB connection
    if 'client' in locals():
        client.close()
        print("\nMongoDB Atlas connection closed")