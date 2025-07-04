import os
import sys
import json
import pymongo
from pymongo import MongoClient
from google.oauth2 import service_account
import google.auth.transport.requests

def print_section(title):
    """Print a section title with formatting."""
    print("\n" + "=" * 80)
    print(f" {title} ".center(80, "="))
    print("=" * 80)

def connect_with_gcp_service_account(service_account_email, key_file_path, cluster_name, db_name="eyewear_ml"):
    """
    Connect to MongoDB Atlas using a GCP service account.
    
    Args:
        service_account_email: The email of the GCP service account
        key_file_path: Path to the service account key file (JSON)
        cluster_name: The MongoDB Atlas cluster name
        db_name: The database name to connect to
        
    Returns:
        A MongoDB client if successful, None otherwise
    """
    print(f"Connecting to MongoDB Atlas using GCP service account: {service_account_email}")
    
    try:
        # Load the service account key file
        if not os.path.exists(key_file_path):
            print(f"❌ Service account key file not found: {key_file_path}")
            return None
            
        # Create credentials from the service account file
        credentials = service_account.Credentials.from_service_account_file(
            key_file_path,
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        
        # Request an access token
        auth_req = google.auth.transport.requests.Request()
        credentials.refresh(auth_req)
        
        # Get the access token
        token = credentials.token
        
        # Construct the MongoDB Atlas connection string with GOOGLE authentication
        connection_string = f"mongodb+srv://{service_account_email}@{cluster_name}/?authMechanism=MONGODB-X509&authSource=$external"
        
        print(f"Using connection string: {connection_string}")
        
        # Connect to MongoDB Atlas
        client = MongoClient(
            connection_string,
            authMechanism="MONGODB-X509",
            tls=True,
            tlsCertificateKeyFile=key_file_path,
            serverSelectionTimeoutMS=5000
        )
        
        # Ping the database to verify connection
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas")
        
        # List all databases
        databases = client.list_database_names()
        print(f"Available databases: {', '.join(databases)}")
        
        # Use the specified database
        db = client[db_name]
        
        # Get list of collections
        collections = db.list_collection_names()
        print(f"\nFound {len(collections)} collections in database '{db_name}':")
        for collection in collections:
            print(f"  - {collection}")
            
        return client
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB Atlas: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def main():
    print_section("MongoDB Atlas GCP Service Account Authentication")
    
    # Get the service account email from the user
    service_account_email = input("Enter the GCP service account email (or press Enter to use the default): ") or "mongodb-atlas-qrcocdvpqqpbzi5d@p-qo02azx9jpwkne0z4u77madz.iam.gserviceaccount.com"
    
    # Get the path to the service account key file
    key_file_path = input("Enter the path to the service account key file (JSON): ")
    if not key_file_path:
        print("❌ Service account key file path is required")
        return
    
    # Get the cluster name
    cluster_name = input("Enter the MongoDB Atlas cluster name (or press Enter to use the default): ") or "cluster0.kqhnm.mongodb.net"
    
    # Get the database name
    db_name = input("Enter the database name (or press Enter to use 'eyewear_ml'): ") or "eyewear_ml"
    
    # Connect to MongoDB Atlas
    client = connect_with_gcp_service_account(service_account_email, key_file_path, cluster_name, db_name)
    
    # Close the connection if successful
    if client:
        client.close()
        print("\nMongoDB Atlas connection closed")
        
    print_section("Connection Test Complete")

if __name__ == "__main__":
    main()