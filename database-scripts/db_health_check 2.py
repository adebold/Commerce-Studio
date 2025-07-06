import pymongo
from pymongo import MongoClient
import sys
import time
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import datetime
import socket

def check_local_mongodb():
    """Check the health of the local MongoDB instance."""
    print("Checking local MongoDB health...")
    
    # Local MongoDB connection string
    local_url = "mongodb://localhost:27018"
    
    try:
        # Connect to MongoDB with a short timeout
        client = MongoClient(local_url, serverSelectionTimeoutMS=2000)
        
        # Ping the database to verify connection
        start_time = time.time()
        client.admin.command('ping')
        response_time = time.time() - start_time
        
        print(f"✅ Local MongoDB is healthy (response time: {response_time:.3f}s)")
        
        # Get server status
        server_status = client.admin.command('serverStatus')
        
        # Extract relevant metrics
        connections = server_status.get('connections', {})
        mem_info = server_status.get('mem', {})
        
        metrics = {
            "response_time": response_time,
            "connections": {
                "current": connections.get('current', 0),
                "available": connections.get('available', 0),
                "total_created": connections.get('totalCreated', 0)
            },
            "memory": {
                "resident": mem_info.get('resident', 0),
                "virtual": mem_info.get('virtual', 0),
                "mapped": mem_info.get('mapped', 0)
            }
        }
        
        # Close the connection
        client.close()
        
        return True, metrics
    except Exception as e:
        print(f"❌ Local MongoDB health check failed: {str(e)}")
        return False, {"error": str(e)}

def check_atlas_mongodb():
    """Check the health of the MongoDB Atlas instance."""
    print("\nChecking MongoDB Atlas health...")
    
    # MongoDB Atlas connection string
    username = os.environ.get('MONGODB_ATLAS_USERNAME', 'eyewear')
    password = os.environ.get('MONGODB_ATLAS_PASSWORD', '')
    cluster_name = "cluster0.kqhnm.mongodb.net"
    db_name = "eyewear"
    
    # Construct the connection string
    atlas_url = f"mongodb+srv://{username}:{password}@{cluster_name}/{db_name}?retryWrites=true&w=majority"
    
    try:
        # Connect to MongoDB with a short timeout
        client = MongoClient(atlas_url, serverSelectionTimeoutMS=5000)
        
        # Ping the database to verify connection
        start_time = time.time()
        client.admin.command('ping')
        response_time = time.time() - start_time
        
        print(f"✅ MongoDB Atlas is healthy (response time: {response_time:.3f}s)")
        
        # Get database stats
        db = client[db_name]
        db_stats = db.command('dbStats')
        
        # Extract relevant metrics
        metrics = {
            "response_time": response_time,
            "database_stats": {
                "collections": db_stats.get('collections', 0),
                "views": db_stats.get('views', 0),
                "objects": db_stats.get('objects', 0),
                "data_size": db_stats.get('dataSize', 0),
                "storage_size": db_stats.get('storageSize', 0),
                "indexes": db_stats.get('indexes', 0),
                "index_size": db_stats.get('indexSize', 0)
            }
        }
        
        # Close the connection
        client.close()
        
        return True, metrics
    except Exception as e:
        print(f"❌ MongoDB Atlas health check failed: {str(e)}")
        return False, {"error": str(e)}

def send_alert_email(subject, message):
    """Send an alert email."""
    # Email configuration
    sender_email = os.getenv("ALERT_EMAIL_SENDER", "alerts@eyewear-ml.com")
    receiver_email = os.getenv("ALERT_EMAIL_RECEIVER", "admin@eyewear-ml.com")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.example.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_username = os.getenv("SMTP_USERNAME", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    
    # Create the email
    email = MIMEMultipart()
    email["From"] = sender_email
    email["To"] = receiver_email
    email["Subject"] = subject
    
    # Add the message body
    email.attach(MIMEText(message, "plain"))
    
    try:
        # Connect to the SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        
        # Login if credentials are provided
        if smtp_username and smtp_password:
            server.login(smtp_username, smtp_password)
        
        # Send the email
        server.sendmail(sender_email, receiver_email, email.as_string())
        
        # Close the connection
        server.quit()
        
        print(f"✅ Alert email sent to {receiver_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send alert email: {str(e)}")
        return False

def log_health_check_results(local_status, local_metrics, atlas_status, atlas_metrics):
    """Log the health check results to a file."""
    # Create the logs directory if it doesn't exist
    os.makedirs("logs", exist_ok=True)
    
    # Create the log file name with timestamp
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_file = f"logs/db_health_check_{timestamp}.json"
    
    # Create the log data
    log_data = {
        "timestamp": timestamp,
        "hostname": socket.gethostname(),
        "local_mongodb": {
            "status": "healthy" if local_status else "unhealthy",
            "metrics": local_metrics
        },
        "atlas_mongodb": {
            "status": "healthy" if atlas_status else "unhealthy",
            "metrics": atlas_metrics
        }
    }
    
    # Write the log data to the file
    with open(log_file, "w") as f:
        json.dump(log_data, f, indent=2)
    
    print(f"\n✅ Health check results logged to {log_file}")
    return log_file

def main():
    print("Database Health Check")
    print("====================")
    print(f"Time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Hostname: {socket.gethostname()}")
    
    # Check local MongoDB health
    local_status, local_metrics = check_local_mongodb()
    
    # Check MongoDB Atlas health
    atlas_status, atlas_metrics = check_atlas_mongodb()
    
    # Log the health check results
    log_file = log_health_check_results(local_status, local_metrics, atlas_status, atlas_metrics)
    
    # Send an alert if either database is unhealthy
    if not local_status or not atlas_status:
        subject = f"⚠️ Database Health Check Alert - {socket.gethostname()}"
        message = f"""
Database Health Check Alert

Time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Hostname: {socket.gethostname()}

Local MongoDB: {"Healthy" if local_status else "Unhealthy"}
MongoDB Atlas: {"Healthy" if atlas_status else "Unhealthy"}

Please check the logs for more details: {log_file}
"""
        send_alert_email(subject, message)
    
    print("\nHealth Check Summary")
    print("===================")
    print(f"Local MongoDB: {'✅ Healthy' if local_status else '❌ Unhealthy'}")
    print(f"MongoDB Atlas: {'✅ Healthy' if atlas_status else '❌ Unhealthy'}")
    
    # Exit with appropriate status code
    if local_status and atlas_status:
        print("\n✅ All databases are healthy")
        sys.exit(0)
    else:
        print("\n⚠️ One or more databases are unhealthy")
        sys.exit(1)

if __name__ == "__main__":
    main()