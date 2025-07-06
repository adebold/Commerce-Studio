# Manual Deployment Guide

This guide provides instructions for manually deploying the Eyewear ML system on your own infrastructure.

## Prerequisites

### System Requirements

1. **Hardware Requirements**
   - CPU: 4+ cores
   - RAM: 16GB+ minimum
   - Storage: 100GB+ SSD
   - GPU: NVIDIA GPU with 8GB+ VRAM (for ML model)

2. **Software Requirements**
   - Ubuntu 20.04 LTS or later
   - Python 3.8+
   - Node.js 18+
   - Docker & Docker Compose
   - NVIDIA drivers & CUDA toolkit
   - nginx
   - Redis

### Network Requirements
- Public IP address
- Domain name (optional)
- SSL certificate (recommended)

## Base System Setup

1. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y build-essential python3-dev
   ```

2. **Install Docker**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Add user to docker group
   sudo usermod -aG docker $USER

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Install NVIDIA Components**
   ```bash
   # Install NVIDIA drivers
   sudo apt install -y nvidia-driver-525

   # Install CUDA toolkit
   wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-ubuntu2004.pin
   sudo mv cuda-ubuntu2004.pin /etc/apt/preferences.d/cuda-repository-pin-600
   sudo apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/3bf863cc.pub
   sudo add-apt-repository "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/ /"
   sudo apt update
   sudo apt install -y cuda
   ```

## Application Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/eyewear-ml.git
   cd eyewear-ml
   ```

2. **Set Up Environment**
   ```bash
   # Backend
   cp .env.example .env
   # Edit .env with production values

   # Frontend
   cd frontend
   cp .env.example .env
   # Edit .env with production values
   cd ..
   ```

3. **Create Data Directories**
   ```bash
   sudo mkdir -p /var/lib/eyewear-ml/{uploads,models,logs}
   sudo chown -R $USER:$USER /var/lib/eyewear-ml
   ```

## Database Setup

1. **Install Redis**
   ```bash
   sudo apt install -y redis-server

   # Configure Redis
   sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup
   sudo sed -i 's/^bind 127.0.0.1/bind 127.0.0.1/' /etc/redis/redis.conf
   sudo sed -i 's/^# requirepass foobared/requirepass your-strong-password/' /etc/redis/redis.conf
   sudo systemctl restart redis
   ```

## ML Model Setup

1. **Install ML Dependencies**
   ```bash
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

2. **Download Pre-trained Model**
   ```bash
   # Create models directory
   mkdir -p models

   # Download model (replace URL with actual model location)
   wget https://storage.googleapis.com/eyewear-ml-models/model-latest.tar.gz
   tar -xzf model-latest.tar.gz -C models/
   ```

## Application Build

1. **Build Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

2. **Build Backend**
   ```bash
   # Build Docker image
   docker build -t eyewear-ml-api .
   ```

## Nginx Setup

1. **Install and Configure Nginx**
   ```bash
   sudo apt install -y nginx

   # Create nginx configuration
   sudo nano /etc/nginx/sites-available/eyewear-ml
   ```

2. **Add Nginx Configuration**
   ```nginx
   # Frontend
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/eyewear-ml;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
           expires 1h;
           add_header Cache-Control "public, no-transform";
       }

       location /static {
           expires 1y;
           add_header Cache-Control "public, no-transform";
       }
   }

   # Backend API
   server {
       listen 80;
       server_name api.your-domain.com;

       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/eyewear-ml /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## SSL Setup (Recommended)

1. **Install Certbot**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com -d api.your-domain.com
   ```

## Service Setup

1. **Create Systemd Service for API**
   ```bash
   sudo nano /etc/systemd/system/eyewear-ml-api.service
   ```

   Add the following content:
   ```ini
   [Unit]
   Description=Eyewear ML API
   After=docker.service
   Requires=docker.service

   [Service]
   Type=simple
   User=your-user
   WorkingDirectory=/path/to/eyewear-ml
   ExecStart=/usr/bin/docker run --rm \
       --name eyewear-ml-api \
       -p 8080:8080 \
       --env-file .env \
       -v /var/lib/eyewear-ml:/data \
       eyewear-ml-api

   [Install]
   WantedBy=multi-user.target
   ```

2. **Create Systemd Service for ML Model**
   ```bash
   sudo nano /etc/systemd/system/eyewear-ml-model.service
   ```

   Add the following content:
   ```ini
   [Unit]
   Description=Eyewear ML Model Service
   After=network.target

   [Service]
   Type=simple
   User=your-user
   WorkingDirectory=/path/to/eyewear-ml
   Environment=PYTHONPATH=/path/to/eyewear-ml
   ExecStart=/path/to/eyewear-ml/venv/bin/python src/ml/serve.py

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and Start Services**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable eyewear-ml-api eyewear-ml-model
   sudo systemctl start eyewear-ml-api eyewear-ml-model
   ```

## Monitoring Setup

1. **Install Monitoring Tools**
   ```bash
   sudo apt install -y prometheus node-exporter grafana
   ```

2. **Configure Prometheus**
   ```bash
   sudo nano /etc/prometheus/prometheus.yml
   ```

   Add the following content:
   ```yaml
   scrape_configs:
     - job_name: 'eyewear-ml'
       static_configs:
         - targets: ['localhost:8080']
   ```

3. **Configure Grafana**
   - Access Grafana at http://your-ip:3000
   - Default login: admin/admin
   - Add Prometheus data source
   - Import dashboard from monitoring/grafana-dashboard.json

## Backup Setup

1. **Create Backup Script**
   ```bash
   sudo nano /usr/local/bin/backup-eyewear-ml.sh
   ```

   Add the following content:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/eyewear-ml"
   DATE=$(date +%Y%m%d_%H%M%S)

   # Create backup directory
   mkdir -p "$BACKUP_DIR"

   # Backup data
   tar -czf "$BACKUP_DIR/data_$DATE.tar.gz" /var/lib/eyewear-ml/

   # Backup Redis
   redis-cli save
   cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis_$DATE.rdb"

   # Cleanup old backups (keep last 7 days)
   find "$BACKUP_DIR" -type f -mtime +7 -delete
   ```

2. **Set Up Cron Job**
   ```bash
   sudo chmod +x /usr/local/bin/backup-eyewear-ml.sh
   sudo crontab -e
   ```

   Add the following line:
   ```
   0 0 * * * /usr/local/bin/backup-eyewear-ml.sh
   ```

## Security Considerations

1. **Firewall Setup**
   ```bash
   # Install UFW
   sudo apt install -y ufw

   # Configure firewall
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

2. **Secure Redis**
   ```bash
   # Bind to localhost only
   sudo sed -i 's/^bind .*/bind 127.0.0.1/' /etc/redis/redis.conf

   # Set password
   sudo sed -i 's/^# requirepass .*/requirepass your-strong-password/' /etc/redis/redis.conf

   # Restart Redis
   sudo systemctl restart redis
   ```

3. **File Permissions**
   ```bash
   # Secure application files
   sudo chown -R root:root /path/to/eyewear-ml
   sudo chmod -R 755 /path/to/eyewear-ml

   # Secure data directory
   sudo chown -R www-data:www-data /var/lib/eyewear-ml
   sudo chmod -R 750 /var/lib/eyewear-ml
   ```

## Maintenance

1. **Log Rotation**
   ```bash
   sudo nano /etc/logrotate.d/eyewear-ml
   ```

   Add the following content:
   ```
   /var/lib/eyewear-ml/logs/*.log {
       daily
       rotate 7
       compress
       delaycompress
       missingok
       notifempty
       create 0640 www-data www-data
   }
   ```

2. **System Updates**
   ```bash
   # Create update script
   sudo nano /usr/local/bin/update-eyewear-ml.sh
   ```

   Add the following content:
   ```bash
   #!/bin/bash
   cd /path/to/eyewear-ml

   # Pull latest changes
   git pull

   # Update dependencies
   source venv/bin/activate
   pip install -r requirements.txt

   # Rebuild frontend
   cd frontend
   npm install
   npm run build
   cd ..

   # Rebuild backend
   docker build -t eyewear-ml-api .

   # Restart services
   sudo systemctl restart eyewear-ml-api eyewear-ml-model
   ```

3. **Monitoring Checks**
   ```bash
   # Check service status
   sudo systemctl status eyewear-ml-api eyewear-ml-model

   # Check logs
   sudo journalctl -u eyewear-ml-api
   sudo journalctl -u eyewear-ml-model

   # Check nginx access
   sudo tail -f /var/log/nginx/access.log

   # Check nginx errors
   sudo tail -f /var/log/nginx/error.log
