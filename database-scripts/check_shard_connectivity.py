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
    # Use the shard host names from the SRV record
    shard_hosts = [
        "cluster0-shard-00-00.kqhnm.mongodb.net",
        "cluster0-shard-00-01.kqhnm.mongodb.net",
        "cluster0-shard-00-02.kqhnm.mongodb.net"
    ]
    
    for host in shard_hosts:
        print(f"\nChecking MongoDB Atlas shard host: {host}")
        
        # Check DNS resolution
        dns_success = check_dns_resolution(host)
        
        # Check TCP connection if DNS resolution was successful
        if dns_success:
            tcp_success = check_tcp_connection(host)
        else:
            print("\n⚠️ DNS resolution failed, skipping TCP connection test")
            tcp_success = False
        
        print("\nShard Host Check Summary")
        
        if dns_success and tcp_success:
            print(f"✅ The shard host {host} is valid and reachable")
        else:
            print(f"❌ The shard host {host} is invalid or unreachable")

if __name__ == "__main__":
    main()