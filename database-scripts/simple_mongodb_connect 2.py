import pymongo
from pymongo import MongoClient
import sys

# Try different connection strings
connection_strings = [
    # Standard username/password
    "mongodb+srv://eyewear:S5s2ujNPQjE5rIxN@cluster0.kqhnm.mongodb.net/?retryWrites=true&w=majority",
    
    # With database name
    "mongodb+srv://eyewear:S5s2ujNPQjE5rIxN@cluster0.kqhnm.mongodb.net/eyewear_ml?retryWrites=true&w=majority",
    
    # With appName
    "mongodb+srv://eyewear:S5s2ujNPQjE5rIxN@cluster0.kqhnm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    
    # API key with AWS auth
    "mongodb+srv://yifxfkct:eb745460-a8db-49d7-867e-32863794004e@cluster0.kqhnm.mongodb.net/?retryWrites=true&w=majority&authMechanism=MONGODB-AWS&authSource=$external"
]

# Try each connection string
for i, conn_str in enumerate(connection_strings):
    print(f"\nAttempt {i+1}: Connecting to MongoDB Atlas...")
    
    try:
        # Connect to MongoDB
        client = MongoClient(conn_str, serverSelectionTimeoutMS=5000)
        
        # Ping the database to verify connection
        client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas")
        
        # List all databases
        databases = client.list_database_names()
        print(f"Available databases: {', '.join(databases)}")
        
        # Close the connection
        client.close()
        print("MongoDB Atlas connection closed")
        
        # Exit on success
        sys.exit(0)
        
    except Exception as e:
        print(f"Error connecting to MongoDB Atlas: {str(e)}")
        
print("\nAll connection attempts failed.")