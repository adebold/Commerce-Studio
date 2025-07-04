import socket
import dns.resolver
import requests
import json
import sys

def print_section(title):
    """Print a section title with formatting."""
    print("\n" + "=" * 80)
    print(f" {title} ".center(80, "="))
    print("=" * 80)

def check_dns_resolution(hostname):
    """Check DNS resolution for a hostname."""
    print(f"Testing DNS resolution for: {hostname}")
    
    try:
        # Try standard DNS lookup
        ip_address = socket.gethostbyname(hostname)
        print(f"✅ Standard DNS lookup successful: {ip_address}")
        return True
    except socket.gaierror:
        print("❌ Standard DNS lookup failed")
    
    try:
        # Try DNS resolver with A records
        answers = dns.resolver.resolve(hostname, 'A')
        print(f"✅ DNS A record lookup successful: {[str(rdata) for rdata in answers]}")
        return True
    except Exception as e:
        print(f"❌ DNS A record lookup failed: {str(e)}")
    
    try:
        # Try DNS resolver with SRV records (MongoDB Atlas uses SRV records)
        srv_hostname = f"_mongodb._tcp.{hostname}"
        answers = dns.resolver.resolve(srv_hostname, 'SRV')
        print(f"✅ DNS SRV record lookup successful: {[str(rdata) for rdata in answers]}")
        return True
    except Exception as e:
        print(f"❌ DNS SRV record lookup failed: {str(e)}")
    
    return False

def check_tcp_connection(hostname, port=27017):
    """Check TCP connection to a hostname and port."""
    print(f"Testing TCP connection to: {hostname}:{port}")
    
    try:
        # Create a socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5)
        
        # Try to connect
        s.connect((hostname, port))
        s.close()
        print(f"✅ TCP connection successful")
        return True
    except Exception as e:
        print(f"❌ TCP connection failed: {str(e)}")
        return False

def get_mongodb_atlas_clusters():
    """Try to get a list of MongoDB Atlas clusters from the API."""
    print("Checking for MongoDB Atlas clusters...")
    print("Note: This requires a valid API key and Organization ID")
    
    api_key = input("Enter your MongoDB Atlas Public API Key (or press Enter to skip): ")
    if not api_key:
        print("Skipping MongoDB Atlas API check")
        return
    
    api_secret = input("Enter your MongoDB Atlas Private API Key: "os.environ.get('CHECK_MONGODB_CLUSTER_SECRET')'CHECK_MONGODB_CLUSTER_SECRET')'CHECK_MONGODB_CLUSTER_SECRET')'CHECK_MONGODB_CLUSTER_SECRET')"Enter your MongoDB Atlas Organization ID: ")
    
    if not api_secret or not org_id:
        print("Skipping MongoDB Atlas API check (missing required information)")
        return
    
    try:
        # Construct the API URL
        url = f"https://cloud.mongodb.com/api/atlas/v1.0/groups"
        
        # Set up authentication
        auth = (api_key, api_secret)
        
        # Set up headers
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        # Make the request
        response = requests.get(url, auth=auth, headers=headers)
        
        # Check if the request was successful
        if response.status_code == 200:
            # Parse the response
            data = response.json()
            
            # Print the projects
            print("\nMongoDB Atlas Projects:")
            for project in data.get("results", []):
                print(f"  - {project.get('name')} (ID: {project.get('id')})")
            
            # Ask which project to check
            project_id = input("\nEnter the Project ID to check for clusters (or press Enter to skip): ")
            if not project_id:
                print("Skipping cluster check")
                return
            
            # Get the clusters for the selected project
            url = f"https://cloud.mongodb.com/api/atlas/v1.0/groups/{project_id}/clusters"
            response = requests.get(url, auth=auth, headers=headers)
            
            # Check if the request was successful
            if response.status_code == 200:
                # Parse the response
                data = response.json()
                
                # Print the clusters
                print("\nMongoDB Atlas Clusters:")
                for cluster in data.get("results", []):
                    print(f"  - {cluster.get('name')}")
                    print(f"    Connection String: {cluster.get('connectionStrings', {}).get('standardSrv')}")
                    print(f"    State: {cluster.get('stateName')}")
                    print(f"    MongoDB Version: {cluster.get('mongoDBVersion')}")
            else:
                print(f"❌ Failed to get clusters: {response.status_code} - {response.text}")
        else:
            print(f"❌ Failed to get projects: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error checking MongoDB Atlas API: {str(e)}")

def main():
    print_section("MongoDB Atlas Cluster Check")
    
    # Get the cluster name from the user
    cluster_name = input("Enter the MongoDB Atlas cluster hostname (default: cluster0.kqhnm.mongodb.net): ") or "cluster0.kqhnm.mongodb.net"
    
    # Check DNS resolution
    dns_success = check_dns_resolution(cluster_name)
    
    # Check TCP connection if DNS resolution was successful
    if dns_success:
        tcp_success = check_tcp_connection(cluster_name)
    else:
        print("\n⚠️ DNS resolution failed, skipping TCP connection test")
        tcp_success = False
    
    # Try to get MongoDB Atlas clusters
    get_mongodb_atlas_clusters()
    
    print_section("Cluster Check Summary")
    
    if dns_success and tcp_success:
        print("✅ The cluster hostname is valid and reachable")
        print("\nIf you're still having connection issues, check:")
        print("1. Authentication credentials (username/password, API keys, etc.)")
        print("2. Database user permissions")
        print("3. Connection string format")
    else:
        print("❌ The cluster hostname is invalid or unreachable")
        print("\nPossible issues:")
        print("1. The cluster name is incorrect")
        print("2. The cluster has been deleted or renamed")
        print("3. The cluster is paused")
        print("4. Network issues preventing connection")
        print("\nRecommended actions:")
        print("1. Verify the cluster name in the MongoDB Atlas dashboard")
        print("2. Check the cluster status in MongoDB Atlas")
        print("3. Try connecting from a different network")
        print("4. Use the MongoDB Atlas API to get a list of available clusters")

if __name__ == "__main__":
    main()