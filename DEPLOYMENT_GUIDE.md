# Mustafa Cangil Auto Trading Ltd. - VPS Deployment Guide

This guide covers deploying the Mustafa Cangil Auto Trading Ltd. application to a VPS server, including both backend (Node.js + MySQL) and frontend (Next.js) components.

## 📋 Prerequisites

- VPS with Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access
- Domain name pointing to your VPS IP
- SSL certificate (Let's Encrypt recommended)

## 🛠️ Server Setup

### 1. Update System and Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8.0
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install PM2 for process management
sudo npm install -g pm2

# Install Docker (optional, for easier deployment)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Configure MySQL

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE mcangilmotors;
CREATE USER 'mcangil'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON mcangilmotors.* TO 'mcangil'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow essential ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3001  # Backend (if not using reverse proxy)
```

## 🚀 Backend Deployment

### 1. Clone and Setup Backend

```bash
# Create application directory
sudo mkdir -p /var/www/mcangilmotors
sudo chown $USER:$USER /var/www/mcangilmotors
cd /var/www/mcangilmotors

# Clone repository
git clone <your-repo-url> .

# Navigate to backend
cd backend

# Install dependencies
npm install

# Install Prisma CLI globally
sudo npm install -g prisma
```

### 2. Configure Environment Variables

```bash
# Copy environment template
cp env.example .env

# Edit environment file
nano .env
```

**Backend .env Configuration:**
```env
# Database
DATABASE_URL="mysql://mcangil:your_secure_password@localhost:3306/mcangilmotors"

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_here

# CORS
CORS_ORIGIN=https://yourdomain.com

# File Upload
UPLOAD_PATH=/var/www/mcangilmotors/backend/public/uploads
MAX_FILE_SIZE=10485760

# Admin
ADMIN_EMAIL=admin@mcangilmotors.com
ADMIN_PASSWORD=your_admin_password
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database
npm run seed
```

### 4. Build and Test Backend

```bash
# Build the application
npm run build

# Test the build
npm start
```

### 5. Configure PM2 for Backend

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**PM2 Configuration (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [
    {
      name: 'mcangilmotors-backend',
      script: 'dist/index.js',
      cwd: '/var/www/mcangilmotors/backend',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/mcangilmotors-backend-error.log',
      out_file: '/var/log/pm2/mcangilmotors-backend-out.log',
      log_file: '/var/log/pm2/mcangilmotors-backend.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

## 🌐 Frontend Deployment

### 1. Setup Frontend

```bash
# Navigate to frontend directory
cd /var/www/mcangilmotors/frontend

# Install dependencies
npm install

# Install Next.js build dependencies
npm install --production
```

### 2. Configure Frontend Environment

```bash
# Create production environment file
nano .env.production
```

**Frontend .env.production:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME="Mustafa Cangil Auto Trading Ltd."

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 3. Build Frontend

```bash
# Build the application
npm run build

# Test the build
npm start
```

### 4. Configure PM2 for Frontend

```bash
# Add frontend to PM2 ecosystem
nano ecosystem.config.js
```

**Updated PM2 Configuration:**
```javascript
module.exports = {
  apps: [
    {
      name: 'mcangilmotors-backend',
      script: 'dist/index.js',
      cwd: '/var/www/mcangilmotors/backend',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/mcangilmotors-backend-error.log',
      out_file: '/var/log/pm2/mcangilmotors-backend-out.log',
      log_file: '/var/log/pm2/mcangilmotors-backend.log',
      time: true,
      max_memory_restart: '1G'
    },
    {
      name: 'mcangilmotors-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/mcangilmotors/frontend',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/mcangilmotors-frontend-error.log',
      out_file: '/var/log/pm2/mcangilmotors-frontend-out.log',
      log_file: '/var/log/pm2/mcangilmotors-frontend.log',
      time: true,
      max_memory_restart: '1G'
    }
  ]
};
```

```bash
# Restart PM2 with both apps
pm2 restart ecosystem.config.js
pm2 save
```

## 🔧 Nginx Configuration

### 1. Create Nginx Configuration

```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/mcangilmotors
```

**Nginx Configuration:**
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

# Upstream servers
upstream backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

upstream frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Main server block
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://yourdomain.com";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Static files (uploads)
    location /uploads/ {
        alias /var/www/mcangilmotors/backend/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
        
        # Security for uploads
        location ~* \.(php|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }
    
    # Frontend routes
    location / {
        limit_req zone=general burst=50 nodelay;
        
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 2. Enable Site and Test Configuration

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/mcangilmotors /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## 🔒 SSL Certificate Setup

### 1. Install SSL Certificate

```bash
# Install SSL certificate with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 2. Setup Auto-renewal

```bash
# Add to crontab
sudo crontab -e

# Add this line for auto-renewal
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📁 File Permissions and Security

### 1. Set Proper Permissions

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/mcangilmotors

# Set permissions
sudo chmod -R 755 /var/www/mcangilmotors
sudo chmod -R 644 /var/www/mcangilmotors/backend/public/uploads

# Secure uploads directory
sudo chmod 755 /var/www/mcangilmotors/backend/public/uploads
```

### 2. Create Log Directories

```bash
# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Create application log directory
sudo mkdir -p /var/log/mcangilmotors
sudo chown www-data:www-data /var/log/mcangilmotors
```

## 🚀 Deployment Script

Create a deployment script for easy updates:

```bash
# Create deployment script
nano deploy.sh
```

**Deployment Script (deploy.sh):**
```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment...${NC}"

# Navigate to project directory
cd /var/www/mcangilmotors

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes...${NC}"
git pull origin main

# Backend deployment
echo -e "${YELLOW}Deploying backend...${NC}"
cd backend
npm install --production
npx prisma generate
npx prisma db push
npm run build

# Frontend deployment
echo -e "${YELLOW}Deploying frontend...${NC}"
cd ../frontend
npm install --production
npm run build

# Restart PM2 processes
echo -e "${YELLOW}Restarting services...${NC}"
pm2 restart ecosystem.config.js

# Test services
echo -e "${YELLOW}Testing services...${NC}"
sleep 5
curl -f http://localhost:3001/api/health || echo -e "${RED}Backend health check failed${NC}"
curl -f http://localhost:3000 || echo -e "${RED}Frontend health check failed${NC}"

echo -e "${GREEN}Deployment completed!${NC}"
```

```bash
# Make script executable
chmod +x deploy.sh
```

## 🔍 Monitoring and Maintenance

### 1. PM2 Monitoring

```bash
# View PM2 status
pm2 status

# View logs
pm2 logs mcangilmotors-backend
pm2 logs mcangilmotors-frontend

# Monitor resources
pm2 monit
```

### 2. System Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql
```

### 3. Backup Script

```bash
# Create backup script
nano backup.sh
```

**Backup Script (backup.sh):**
```bash
#!/bin/bash

BACKUP_DIR="/var/backups/mcangilmotors"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u mcangil -p mcangilmotors > $BACKUP_DIR/database_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/application_$DATE.tar.gz /var/www/mcangilmotors

# Uploads backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/mcangilmotors/backend/public/uploads

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo lsof -i :3001
   ```

2. **Permission Denied**
   ```bash
   sudo chown -R www-data:www-data /var/www/mcangilmotors
   ```

3. **Database Connection Issues**
   ```bash
   sudo systemctl restart mysql
   npx prisma db push
   ```

4. **Nginx Configuration Issues**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Log Locations

- **PM2 Logs**: `/var/log/pm2/`
- **Nginx Logs**: `/var/log/nginx/`
- **MySQL Logs**: `/var/log/mysql/`
- **System Logs**: `/var/log/syslog`

## 📊 Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_cars_make ON cars(make);
CREATE INDEX idx_cars_year ON cars(year);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_cars_featured ON cars(featured);
```

### 2. Nginx Caching

```nginx
# Add to nginx config for better caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;

location /api/cars {
    proxy_cache my_cache;
    proxy_cache_valid 200 302 10m;
    proxy_cache_valid 404 1m;
}
```

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Check logs and system resources
2. **Monthly**: Update system packages
3. **Quarterly**: Review and optimize database
4. **As needed**: Deploy application updates

### Update Process

```bash
# Run deployment script
./deploy.sh

# Or manual update
git pull origin main
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
pm2 restart all
```

This deployment guide provides a complete setup for your Mustafa Cangil Auto Trading Ltd. application on a VPS, following the specifications in your .cursorrules file.





