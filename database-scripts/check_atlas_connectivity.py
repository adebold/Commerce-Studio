import socket
import dns.resolver
import sys

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

def main():
    # Use the default cluster name
    cluster_name = "cluster0.kqhnm.mongodb.net"
    
    print(f"\nChecking MongoDB Atlas cluster: {cluster_name}")
    
    # Check DNS resolution
    dns_success = check_dns_resolution(cluster_name)
    
    # Check TCP connection if DNS resolution was successful
    if dns_success:
        tcp_success = check_tcp_connection(cluster_name)
    else:
        print("\n⚠️ DNS resolution failed, skipping TCP connection test")
        tcp_success = False
    
    print("\nCluster Check Summary")
    
    if dns_success and tcp_success:
        print("✅ The cluster hostname is valid and reachable")
    else:
        print("❌ The cluster hostname is invalid or unreachable")

if __name__ == "__main__":
    main()