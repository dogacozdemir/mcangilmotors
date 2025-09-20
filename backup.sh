#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/var/backups/mcangilmotors"
PROJECT_DIR="/var/www/mcangilmotors"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Mustafa Cangil Auto Trading Ltd. Backup${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create backup
create_backup() {
    echo -e "${YELLOW}Creating backup...${NC}"
    
    # Create backup directory
    mkdir -p $BACKUP_DIR
    
    # Database backup
    if command_exists mysqldump; then
        echo -e "${YELLOW}Backing up database...${NC}"
        mysqldump -u mcangil -p mcangilmotors > $BACKUP_DIR/database_$DATE.sql
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Database backup created: database_$DATE.sql${NC}"
        else
            echo -e "${RED}✗ Database backup failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ mysqldump not found, skipping database backup${NC}"
    fi
    
    # Application backup
    echo -e "${YELLOW}Backing up application...${NC}"
    tar -czf $BACKUP_DIR/application_$DATE.tar.gz -C /var/www mcangilmotors
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Application backup created: application_$DATE.tar.gz${NC}"
    else
        echo -e "${RED}✗ Application backup failed${NC}"
        return 1
    fi
    
    # Uploads backup
    echo -e "${YELLOW}Backing up uploads...${NC}"
    tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $PROJECT_DIR/backend/public uploads
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Uploads backup created: uploads_$DATE.tar.gz${NC}"
    else
        echo -e "${RED}✗ Uploads backup failed${NC}"
        return 1
    fi
    
    # Configuration backup
    echo -e "${YELLOW}Backing up configuration...${NC}"
    tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
        /etc/nginx/sites-available/mcangilmotors \
        /etc/letsencrypt/live/yourdomain.com/ \
        $PROJECT_DIR/ecosystem.config.js \
        $PROJECT_DIR/backend/.env \
        $PROJECT_DIR/frontend/.env.production
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Configuration backup created: config_$DATE.tar.gz${NC}"
    else
        echo -e "${YELLOW}⚠ Configuration backup had some issues${NC}"
    fi
}

# Function to clean old backups
clean_old_backups() {
    echo -e "${YELLOW}Cleaning old backups (older than $RETENTION_DAYS days)...${NC}"
    
    # Clean database backups
    find $BACKUP_DIR -name "database_*.sql" -mtime +$RETENTION_DAYS -delete
    echo -e "${GREEN}✓ Old database backups cleaned${NC}"
    
    # Clean application backups
    find $BACKUP_DIR -name "application_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    echo -e "${GREEN}✓ Old application backups cleaned${NC}"
    
    # Clean uploads backups
    find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    echo -e "${GREEN}✓ Old uploads backups cleaned${NC}"
    
    # Clean config backups
    find $BACKUP_DIR -name "config_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    echo -e "${GREEN}✓ Old config backups cleaned${NC}"
}

# Function to show backup status
show_backup_status() {
    echo -e "${YELLOW}Backup status:${NC}"
    
    # Show backup directory size
    if [ -d "$BACKUP_DIR" ]; then
        BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
        echo -e "${BLUE}Backup directory size: $BACKUP_SIZE${NC}"
    fi
    
    # Count backup files
    DB_COUNT=$(find $BACKUP_DIR -name "database_*.sql" | wc -l)
    APP_COUNT=$(find $BACKUP_DIR -name "application_*.tar.gz" | wc -l)
    UPLOAD_COUNT=$(find $BACKUP_DIR -name "uploads_*.tar.gz" | wc -l)
    CONFIG_COUNT=$(find $BACKUP_DIR -name "config_*.tar.gz" | wc -l)
    
    echo -e "${BLUE}Database backups: $DB_COUNT${NC}"
    echo -e "${BLUE}Application backups: $APP_COUNT${NC}"
    echo -e "${BLUE}Uploads backups: $UPLOAD_COUNT${NC}"
    echo -e "${BLUE}Config backups: $CONFIG_COUNT${NC}"
}

# Function to restore from backup
restore_backup() {
    local backup_date=$1
    
    if [ -z "$backup_date" ]; then
        echo -e "${RED}Please provide backup date (YYYYMMDD_HHMMSS)${NC}"
        echo -e "${YELLOW}Available backups:${NC}"
        ls -la $BACKUP_DIR | grep $DATE | head -5
        return 1
    fi
    
    echo -e "${YELLOW}Restoring from backup: $backup_date${NC}"
    
    # Restore database
    if [ -f "$BACKUP_DIR/database_$backup_date.sql" ]; then
        echo -e "${YELLOW}Restoring database...${NC}"
        mysql -u mcangil -p mcangilmotors < $BACKUP_DIR/database_$backup_date.sql
        echo -e "${GREEN}✓ Database restored${NC}"
    else
        echo -e "${RED}✗ Database backup not found: database_$backup_date.sql${NC}"
    fi
    
    # Restore application
    if [ -f "$BACKUP_DIR/application_$backup_date.tar.gz" ]; then
        echo -e "${YELLOW}Restoring application...${NC}"
        tar -xzf $BACKUP_DIR/application_$backup_date.tar.gz -C /var/www/
        echo -e "${GREEN}✓ Application restored${NC}"
    else
        echo -e "${RED}✗ Application backup not found: application_$backup_date.tar.gz${NC}"
    fi
    
    # Restore uploads
    if [ -f "$BACKUP_DIR/uploads_$backup_date.tar.gz" ]; then
        echo -e "${YELLOW}Restoring uploads...${NC}"
        tar -xzf $BACKUP_DIR/uploads_$backup_date.tar.gz -C $PROJECT_DIR/backend/public/
        echo -e "${GREEN}✓ Uploads restored${NC}"
    else
        echo -e "${RED}✗ Uploads backup not found: uploads_$backup_date.tar.gz${NC}"
    fi
    
    echo -e "${GREEN}✓ Restore completed${NC}"
}

# Main function
main() {
    case "${1:-backup}" in
        "backup")
            create_backup
            clean_old_backups
            show_backup_status
            echo -e "${GREEN}✓ Backup completed successfully!${NC}"
            ;;
        "status")
            show_backup_status
            ;;
        "restore")
            restore_backup $2
            ;;
        "clean")
            clean_old_backups
            show_backup_status
            ;;
        *)
            echo -e "${YELLOW}Usage: $0 [backup|status|restore|clean]${NC}"
            echo -e "${YELLOW}  backup  - Create new backup (default)${NC}"
            echo -e "${YELLOW}  status  - Show backup status${NC}"
            echo -e "${YELLOW}  restore - Restore from backup (requires date)${NC}"
            echo -e "${YELLOW}  clean   - Clean old backups${NC}"
            ;;
    esac
}

# Run main function
main "$@"





