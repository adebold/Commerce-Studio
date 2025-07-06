import os
import sys
import json
import pymongo
from pymongo import MongoClient
from urllib.parse import quote_plus
import traceback

def print_section(title):
    """Print a section title with formatting."""
    print("\n" + "=" * 80)
    print(f" {title} ".center(80, "="))
    print("=" * 80)

def print_subsection(title):
    """Print a subsection title with formatting."""
    print("\n" + "-" * 80)
    print(f" {title} ".center(80, "-"))
    print("-" * 80)

def test_standard_auth(username, password, cluster_name, db_name="eyewear_ml"):
    """Test MongoDB Atlas connection with standard username/password authentication."""
    print_subsection("Testing Standard Authentication")
    
    # Construct the connection string
    connection_string = f"mongodb+srv://{quote_plus(username)}:{quote_plus(password)}@{cluster_name}/?retryWrites=true&w=majority"
    
    print(f"Connection string: mongodb+srv://{username}:****@{cluster_name}/?retryWrites=true&w=majority")
    print(f"Database: {db_name}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        
        # Ping the database to verify connection
        client.admin.command('ping')
        print("✅ Connection successful")
        
        # List all databases
        databases = client.list_database_names()
        print(f"Available databases: {', '.join(databases)}")
        
        # Check if the specified database exists
        if db_name in databases:
            # Get list of collections
            db = client[db_name]
            collections = db.list_collection_names()
            print(f"\nFound {len(collections)} collections in database '{db_name}':")
            for collection in collections:
                count = db[collection].count_documents({})
                print(f"  - {collection}: {count} documents")
        else:
            print(f"⚠️ Database '{db_name}' not found")
        
        # Close the connection
        client.close()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

def test_api_key_auth(public_key, private_key, cluster_name, db_name="eyewear_ml"):
    """Test MongoDB Atlas connection with API key authentication."""
    print_subsection("Testing API Key Authentication")
    
    # Construct the connection string
    connection_string = f"mongodb+srv://{quote_plus(public_key)}:{quote_plus(private_key)}@{cluster_name}/?retryWrites=true&w=majority&authMechanism=MONGODB-AWS&authSource=$external"
    
    print(f"Connection string: mongodb+srv://{public_key}:****@{cluster_name}/?retryWrites=true&w=majority&authMechanism=MONGODB-AWS&authSource=$external")
    print(f"Database: {db_name}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        
        # Ping the database to verify connection
        client.admin.command('ping')
        print("✅ Connection successful")
        
        # List all databases
        databases = client.list_database_names()
        print(f"Available databases: {', '.join(databases)}")
        
        # Check if the specified database exists
        if db_name in databases:
            # Get list of collections
            db = client[db_name]
            collections = db.list_collection_names()
            print(f"\nFound {len(collections)} collections in database '{db_name}':")
            for collection in collections:
                count = db[collection].count_documents({})
                print(f"  - {collection}: {count} documents")
        else:
            print(f"⚠️ Database '{db_name}' not found")
        
        # Close the connection
        client.close()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

def test_x509_auth(cluster_name, cert_file, db_name="eyewear_ml"):
    """Test MongoDB Atlas connection with X.509 certificate authentication."""
    print_subsection("Testing X.509 Certificate Authentication")
    
    # Construct the connection string
    connection_string = f"mongodb+srv://{cluster_name}/?authMechanism=MONGODB-X509&tls=true&tlsCertificateKeyFile={quote_plus(cert_file)}"
    
    print(f"Connection string: mongodb+srv://{cluster_name}/?authMechanism=MONGODB-X509&tls=true&tlsCertificateKeyFile=****")
    print(f"Database: {db_name}")
    print(f"Certificate file: {cert_file}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(
            connection_string,
            tls=True,
            tlsCertificateKeyFile=cert_file,
            serverSelectionTimeoutMS=5000
        )
        
        # Ping the database to verify connection
        client.admin.command('ping')
        print("✅ Connection successful")
        
        # List all databases
        databases = client.list_database_names()
        print(f"Available databases: {', '.join(databases)}")
        
        # Check if the specified database exists
        if db_name in databases:
            # Get list of collections
            db = client[db_name]
            collections = db.list_collection_names()
            print(f"\nFound {len(collections)} collections in database '{db_name}':")
            for collection in collections:
                count = db[collection].count_documents({})
                print(f"  - {collection}: {count} documents")
        else:
            print(f"⚠️ Database '{db_name}' not found")
        
        # Close the connection
        client.close()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

def main():
    print_section("MongoDB Atlas Connection Options")
    
    # Get the cluster name
    cluster_name = input("Enter the MongoDB Atlas cluster name (default: cluster0.kqhnm.mongodb.net): ") or "cluster0.kqhnm.mongodb.net"
    
    # Get the database name
    db_name = input("Enter the database name (default: eyewear_ml): ") or "eyewear_ml"
    
    # Menu for authentication methods
    print("\nSelect an authentication method:")
    print("1. Standard username/password")
    print("2. API key")
    print("3. X.509 certificate")
    
    choice = input("\nEnter your choice (1-3): ")
    
    if choice == "1":
        # Standard username/password authentication
        username = input("Enter username: ")
        password = input("Enter password: ")
        
        if not username or not password:
            print("❌ Username and password are required")
            return
            
        test_standard_auth(username, password, cluster_name, db_name)
        
    elif choice == "2":
        # API key authentication
        public_key = input("Enter public key: "os.environ.get('PRIVATE_KEY')'PRIVATE_KEY')'PRIVATE_KEY')'PRIVATE_KEY')"Enter private key: ")
        
        if not public_key or not private_key:
            print("❌ Public key and private key are required")
            return
            
        test_api_key_auth(public_key, private_key, cluster_name, db_name)
        
    elif choice == "3":
        # X.509 certificate authentication
        cert_file = input("Enter path to certificate file: ")
        
        if not cert_file or not os.path.exists(cert_file):
            print("❌ Certificate file not found")
            return
            
        test_x509_auth(cluster_name, cert_file, db_name)
        
    else:
        print("❌ Invalid choice")
        
    print_section("Connection Test Complete")
    print("\nIf all connection methods failed, please review the MongoDB Atlas documentation:")
    print("https://www.mongodb.com/docs/atlas/connect-to-database-deployment/")
    print("\nFor GCP service account authentication, follow the instructions in:")
    print("gcp_service_account_instructions.md")

if __name__ == "__main__":
    main()