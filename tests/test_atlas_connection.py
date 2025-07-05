import pymongo
from pymongo import MongoClient
import sys

def test_standard_auth():
    """Test MongoDB Atlas connection with standard username/password authentication."""
    print("\nTesting standard username/password authentication...")
    
    username = "eyewear"
    password = "os.environ.get('PRIVATE_KEY_6')'PRIVATE_KEY_5')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'PRIVATE_KEY_6')'PRIVATE_KEY_5')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'TEST_ATLAS_CONNECTION_SECRET_1')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'TEST_ATLAS_CONNECTION_SECRET')'TEST_ATLAS_CONNECTION_SECRET')"
    cluster_name = "cluster0.kqhnm.mongodb.net"
    db_name = "eyewear_ml"
    
    # Construct the connection string
    connection_string = f"mongodb+srv://{username}:{password}@{cluster_name}/{db_name}?retryWrites=true&w=majority"
    
    print(f"Connection string: mongodb+srv://{username}:****@{cluster_name}/{db_name}?retryWrites=true&w=majority")
    
    try:
        # Connect to MongoDB
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        
        # Ping the database to verify connection
        client.admin.command('ping')
        print("✅ Connection successful")
        
        # List all databases
        databases = client.list_database_names()
        print(f"Available databases: {', '.join(databases)}")
        
        # Close the connection
        client.close()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

def test_api_key_auth():
    """Test MongoDB Atlas connection with API key authentication."""
    print("\nTesting API key authentication...")
    
    public_key = "os.environ.get('PRIVATE_KEY_6')'PRIVATE_KEY_5')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'PRIVATE_KEY_6')'PRIVATE_KEY_5')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'TEST_ATLAS_CONNECTION_SECRET_1')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'TEST_ATLAS_CONNECTION_SECRET')'PRIVATE_KEY_5')"
    private_key = "os.environ.get('PRIVATE_KEY_6')'PRIVATE_KEY_5')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'PRIVATE_KEY_6')'PRIVATE_KEY_5')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'TEST_ATLAS_CONNECTION_SECRET_1')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'TEST_ATLAS_CONNECTION_SECRET')'PRIVATE_KEY_4')"
    cluster_name = "cluster0.kqhnm.mongodb.net"
    db_name = "eyewear_ml"
    
    # Construct the connection string
    connection_string = f"mongodb+srv://{public_key}:{private_key}@{cluster_name}/{db_name}?retryWrites=true&w=majority&authMechanism=MONGODB-AWS&authSource=$external"
    
    print(f"Connection string: mongodb+srv://{public_key}:****@{cluster_name}/{db_name}?retryWrites=true&w=majority&authMechanism=MONGODB-AWS&authSource=$external")
    
    try:
        # Connect to MongoDB
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        
        # Ping the database to verify connection
        client.admin.command('ping')
        print("✅ Connection successful")
        
        # List all databases
        databases = client.list_database_names()
        print(f"Available databases: {', '.join(databases)}")
        
        # Close the connection
        client.close()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

def test_service_account_auth():
    """Test MongoDB Atlas connection with service account authentication."""
    print("\nTesting service account authentication...")
    
    client_id = "mdb_sa_id_67f5a65fe158cd1b64309d89"
    client_secret = "os.environ.get('PRIVATE_KEY_6')'PRIVATE_KEY_5')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'PRIVATE_KEY_6')'PRIVATE_KEY_5')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'TEST_ATLAS_CONNECTION_SECRET_1')'PRIVATE_KEY_4')'PRIVATE_KEY_3')'TEST_ATLAS_CONNECTION_SECRET')'TEST_ATLAS_CONNECTION_SECRET_1')"
    cluster_name = "cluster0.kqhnm.mongodb.net"
    db_name = "eyewear_ml"
    
    # Construct the connection string
    connection_string = f"mongodb+srv://{client_id}:{client_secret}@{cluster_name}/{db_name}?retryWrites=true&w=majority&authMechanism=MONGODB-OIDC"
    
    print(f"Connection string: mongodb+srv://{client_id}:****@{cluster_name}/{db_name}?retryWrites=true&w=majority&authMechanism=MONGODB-OIDC")
    
    try:
        # Connect to MongoDB
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        
        # Ping the database to verify connection
        client.admin.command('ping')
        print("✅ Connection successful")
        
        # List all databases
        databases = client.list_database_names()
        print(f"Available databases: {', '.join(databases)}")
        
        # Close the connection
        client.close()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

def main():
    print("MongoDB Atlas Connection Test")
    print("============================")
    
    # Test standard authentication
    standard_auth_success = test_standard_auth()
    
    # Test API key authentication
    api_key_auth_success = test_api_key_auth()
    
    # Test service account authentication
    service_account_auth_success = test_service_account_auth()
    
    print("\nConnection Test Summary")
    print("======================")
    print(f"Standard Authentication: {'✅ Success' if standard_auth_success else '❌ Failed'}")
    print(f"API Key Authentication: {'✅ Success' if api_key_auth_success else '❌ Failed'}")
    print(f"Service Account Authentication: {'✅ Success' if service_account_auth_success else '❌ Failed'}")
    
    if standard_auth_success or api_key_auth_success or service_account_auth_success:
        print("\n✅ At least one authentication method succeeded")
    else:
        print("\n❌ All authentication methods failed")

if __name__ == "__main__":
    main()