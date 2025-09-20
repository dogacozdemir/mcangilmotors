#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/mcangilmotors"
BACKUP_DIR="/var/backups/mcangilmotors"
DATE=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Mustafa Cangil Auto Trading Ltd. Deployment${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check service status
check_service() {
    local service_name=$1
    local port=$2
    
    if curl -f -s "http://localhost:$port" > /dev/null; then
        echo -e "${GREEN}✓ $service_name is running on port $port${NC}"
        return 0
    else
        echo -e "${RED}✗ $service_name is not responding on port $port${NC}"
        return 1
    fi
}

# Function to create backup
create_backup() {
    echo -e "${YELLOW}Creating backup...${NC}"
    
    # Create backup directory
    mkdir -p $BACKUP_DIR
    
    # Database backup
    if command_exists mysqldump; then
        mysqldump -u mcangil -p mcangilmotors > $BACKUP_DIR/database_$DATE.sql
        echo -e "${GREEN}✓ Database backup created${NC}"
    else
        echo -e "${YELLOW}⚠ mysqldump not found, skipping database backup${NC}"
    fi
    
    # Application backup
    tar -czf $BACKUP_DIR/application_$DATE.tar.gz $PROJECT_DIR
    echo -e "${GREEN}✓ Application backup created${NC}"
    
    # Clean old backups (keep last 7 days)
    find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
    echo -e "${GREEN}✓ Old backups cleaned${NC}"
}

# Function to deploy backend
deploy_backend() {
    echo -e "${YELLOW}Deploying backend...${NC}"
    
    cd $PROJECT_DIR/backend
    
    # Install dependencies
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install --production
    
    # Generate Prisma client
    echo -e "${YELLOW}Generating Prisma client...${NC}"
    npx prisma generate
    
    # Run database migrations
    echo -e "${YELLOW}Running database migrations...${NC}"
    npx prisma db push
    
    # Build application
    echo -e "${YELLOW}Building backend...${NC}"
    npm run build
    
    echo -e "${GREEN}✓ Backend deployment completed${NC}"
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${YELLOW}Deploying frontend...${NC}"
    
    cd $PROJECT_DIR/frontend
    
    # Install dependencies
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install --production
    
    # Build application
    echo -e "${YELLOW}Building frontend...${NC}"
    npm run build
    
    echo -e "${GREEN}✓ Frontend deployment completed${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}Restarting services...${NC}"
    
    # Restart PM2 processes
    pm2 restart ecosystem.config.js
    
    # Wait for services to start
    sleep 10
    
    # Check service status
    echo -e "${YELLOW}Checking service status...${NC}"
    check_service "Backend" 3001
    check_service "Frontend" 3000
    
    echo -e "${GREEN}✓ Services restarted${NC}"
}

# Function to run health checks
run_health_checks() {
    echo -e "${YELLOW}Running health checks...${NC}"
    
    # Check backend health
    if curl -f -s "http://localhost:3001/api/health" > /dev/null; then
        echo -e "${GREEN}✓ Backend health check passed${NC}"
    else
        echo -e "${RED}✗ Backend health check failed${NC}"
        return 1
    fi
    
    # Check frontend health
    if curl -f -s "http://localhost:3000" > /dev/null; then
        echo -e "${GREEN}✓ Frontend health check passed${NC}"
    else
        echo -e "${RED}✗ Frontend health check failed${NC}"
        return 1
    fi
    
    # Check nginx
    if sudo systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✓ Nginx is running${NC}"
    else
        echo -e "${RED}✗ Nginx is not running${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ All health checks passed${NC}"
}

# Main deployment function
main() {
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        echo -e "${RED}This script should not be run as root${NC}"
        exit 1
    fi
    
    # Check if project directory exists
    if [ ! -d "$PROJECT_DIR" ]; then
        echo -e "${RED}Project directory $PROJECT_DIR does not exist${NC}"
        exit 1
    fi
    
    # Navigate to project directory
    cd $PROJECT_DIR
    
    # Create backup
    create_backup
    
    # Pull latest changes
    echo -e "${YELLOW}Pulling latest changes...${NC}"
    git pull origin main
    
    # Deploy backend
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    # Restart services
    restart_services
    
    # Run health checks
    run_health_checks
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}  Deployment completed successfully!${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Run main function
main "$@"





