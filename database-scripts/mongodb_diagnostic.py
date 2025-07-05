import os
import sys
import socket
import platform
import pymongo
from pymongo import MongoClient
import dns.resolver
import requests
import json
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

def check_network_connectivity():
    """Check basic network connectivity."""
    print_subsection("Network Connectivity Test")
    
    # Test DNS resolution
    print("Testing DNS resolution...")
    try:
        dns_result = dns.resolver.resolve("cluster0.kqhnm.mongodb.net", "A")
        print(f"✅ DNS resolution successful: {[str(r) for r in dns_result]}")
    except Exception as e:
        print(f"❌ DNS resolution failed: {str(e)}")
    
    # Test connection to MongoDB Atlas
    print("\nTesting connection to MongoDB Atlas...")
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5)
        s.connect(("cluster0.kqhnm.mongodb.net", 27017))
        s.close()
        print("✅ TCP connection to MongoDB Atlas successful")
    except Exception as e:
        print(f"❌ TCP connection to MongoDB Atlas failed: {str(e)}")
    
    # Test internet connectivity
    print("\nTesting internet connectivity...")
    try:
        response = requests.get("https://www.mongodb.com", timeout=5)
        print(f"✅ Internet connectivity successful: Status code {response.status_code}")
    except Exception as e:
        print(f"❌ Internet connectivity test failed: {str(e)}")

def check_system_info():
    """Check system information."""
    print_subsection("System Information")
    
    print(f"Python version: {platform.python_version()}")
    print(f"Platform: {platform.platform()}")
    print(f"PyMongo version: {pymongo.__version__}")
    
    # Check if pymongo[aws] is installed
    try:
        import pymongo_auth_aws
        print(f"pymongo-auth-aws version: {pymongo_auth_aws.__version__}")
    except ImportError:
        print("❌ pymongo-auth-aws is not installed")

def test_connection_string(conn_str, description):
    """Test a MongoDB connection string."""
    print_subsection(f"Testing {description}")
    
    # Hide password in logs
    safe_conn_str = conn_str
    if ":" in conn_str and "@" in conn_str:
        parts = conn_str.split("@")
        auth_parts = parts[0].split(":")
        if len(auth_parts) > 1:
            safe_conn_str = f"{auth_parts[0]}:****@{parts[1]}"
    
    print(f"Connection string: {safe_conn_str}")
    
    try:
        # Connect to MongoDB with a short timeout
        client = MongoClient(conn_str, serverSelectionTimeoutMS=5000)
        
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
        print("\nDetailed error information:")
        traceback.print_exc()
        return False

def main():
    """Main diagnostic function."""
    print_section("MongoDB Atlas Connection Diagnostic")
    
    # Check system information
    check_system_info()
    
    # Check network connectivity
    check_network_connectivity()
    
    # Test different connection strings
    connection_strings = [
        # Standard username/password
        ("mongodb+srv://eyewear:S5s2ujNPQjE5rIxN@cluster0.kqhnm.mongodb.net/?retryWrites=true&w=majority", 
         "Standard Connection String"),
        
        # With database name
        ("mongodb+srv://eyewear:S5s2ujNPQjE5rIxN@cluster0.kqhnm.mongodb.net/eyewear_ml?retryWrites=true&w=majority", 
         "Connection String with Database Name"),
        
        # With appName
        ("mongodb+srv://eyewear:S5s2ujNPQjE5rIxN@cluster0.kqhnm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", 
         "Connection String with App Name"),
        
        # API key with AWS auth
        ("mongodb+srv://yifxfkct:eb745460-a8db-49d7-867e-32863794004e@cluster0.kqhnm.mongodb.net/?retryWrites=true&w=majority&authMechanism=MONGODB-AWS&authSource=$external",
         "API Key with AWS Auth")
    ]
    
    success = False
    for conn_str, desc in connection_strings:
        if test_connection_string(conn_str, desc):
            success = True
            break
    
    print_section("Diagnostic Summary")
    if success:
        print("✅ Successfully connected to MongoDB Atlas")
    else:
        print("❌ All connection attempts failed")
        print("\nPossible issues:")
        print("1. IP address not whitelisted in MongoDB Atlas Network Access settings")
        print("2. Incorrect username/password or API key")
        print("3. User doesn't have proper permissions")
        print("4. Cluster is paused or in maintenance")
        print("5. Firewall blocking outbound connections to MongoDB Atlas")
        print("\nRecommended actions:")
        print("1. Verify IP address in MongoDB Atlas Network Access settings")
        print("2. Check username/password or API key")
        print("3. Verify user permissions in MongoDB Atlas")
        print("4. Check cluster status in MongoDB Atlas")
        print("5. Try connecting from a different network")

if __name__ == "__main__":
    main()