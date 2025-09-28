#!/bin/bash

# Deployment Script for Network Monitor
# Supports both PM2 and systemd deployment methods

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="network-monitor"
APP_DIR="/var/www/network-monitor"
SERVICE_USER="www-data"
SERVICE_GROUP="www-data"
DEPLOYMENT_METHOD="pm2"  # pm2 or systemd

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Network Monitor Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy-pm2      - Deploy using PM2"
    echo "  deploy-systemd  - Deploy using systemd"
    echo "  build           - Build application only"
    echo "  install-deps    - Install dependencies only"
    echo "  setup-db        - Setup database only"
    echo "  status          - Check deployment status"
    echo "  logs            - View application logs"
    echo "  restart         - Restart application"
    echo "  stop            - Stop application"
    echo "  uninstall       - Remove application"
    echo "  help            - Show this help message"
    echo ""
    echo "Options:"
    echo "  --env=ENV       - Set environment (production, staging, development)"
    echo "  --port=PORT     - Set port number"
    echo "  --user=USER     - Set service user"
    echo "  --dir=DIR       - Set application directory"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root for systemd deployment"
        print_status "Use: sudo $0 $@"
        exit 1
    fi
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check if Bun is installed
    if ! command -v bun &> /dev/null; then
        print_error "Bun is not installed. Please install Bun first:"
        echo "curl -fsSL https://bun.sh/install | bash"
        exit 1
    fi
    print_success "Bun is installed"
    
    # Check if PM2 is installed (for PM2 deployment)
    if [ "$DEPLOYMENT_METHOD" = "pm2" ]; then
        if ! command -v pm2 &> /dev/null; then
            print_error "PM2 is not installed. Please install PM2 first:"
            echo "npm install -g pm2"
            exit 1
        fi
        print_success "PM2 is installed"
    fi
}

# Function to create application directory
create_app_directory() {
    print_status "Creating application directory..."
    mkdir -p "$APP_DIR"
    mkdir -p "$APP_DIR/logs"
    print_success "Application directory created: $APP_DIR"
}

# Function to copy application files
copy_application_files() {
    print_status "Copying application files..."
    
    # Copy all files except node_modules, .git, logs
    rsync -av --exclude=node_modules --exclude=.git --exclude=logs --exclude=dist \
        ./ "$APP_DIR/"
    
    print_success "Application files copied"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    cd "$APP_DIR"
    bun install --production
    print_success "Dependencies installed"
}

# Function to build application
build_application() {
    print_status "Building application..."
    cd "$APP_DIR"
    bun run build
    print_success "Application built"
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    cd "$APP_DIR"
    bun run push
    print_success "Database setup complete"
}

# Function to deploy with PM2
deploy_pm2() {
    print_status "Deploying with PM2..."
    
    # Stop existing process
    pm2 stop "$APP_NAME" 2>/dev/null || true
    pm2 delete "$APP_NAME" 2>/dev/null || true
    
    # Update ecosystem config with correct path
    sed -i "s|/Users/david/Documents/Projects/network-monitor|$APP_DIR|g" "$APP_DIR/ecosystem.config.js"
    
    # Start application
    cd "$APP_DIR"
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup startup script
    pm2 startup systemd -u "$SERVICE_USER" --hp "$APP_DIR" || true
    
    print_success "PM2 deployment complete"
}

# Function to deploy with systemd
deploy_systemd() {
    print_status "Deploying with systemd..."
    
    # Create service user
    id -u "$SERVICE_USER" &>/dev/null || useradd -r -s /bin/false "$SERVICE_USER"
    
    # Set ownership
    chown -R "$SERVICE_USER:$SERVICE_GROUP" "$APP_DIR"
    
    # Copy systemd service file
    cp "$APP_DIR/scripts/network-monitor.service" /etc/systemd/system/
    
    # Update service file with correct paths
    sed -i "s|/var/www/network-monitor|$APP_DIR|g" /etc/systemd/system/network-monitor.service
    sed -i "s|www-data|$SERVICE_USER|g" /etc/systemd/system/network-monitor.service
    
    # Reload systemd
    systemctl daemon-reload
    
    # Enable and start service
    systemctl enable network-monitor
    systemctl start network-monitor
    
    print_success "Systemd deployment complete"
}

# Function to check deployment status
check_status() {
    print_status "Checking deployment status..."
    
    if [ "$DEPLOYMENT_METHOD" = "pm2" ]; then
        pm2 status
    else
        systemctl status network-monitor
    fi
}

# Function to view logs
view_logs() {
    print_status "Viewing application logs..."
    
    if [ "$DEPLOYMENT_METHOD" = "pm2" ]; then
        pm2 logs "$APP_NAME" --lines 50
    else
        journalctl -u network-monitor -n 50 --no-pager
    fi
}

# Function to restart application
restart_application() {
    print_status "Restarting application..."
    
    if [ "$DEPLOYMENT_METHOD" = "pm2" ]; then
        pm2 restart "$APP_NAME"
    else
        systemctl restart network-monitor
    fi
    
    print_success "Application restarted"
}

# Function to stop application
stop_application() {
    print_status "Stopping application..."
    
    if [ "$DEPLOYMENT_METHOD" = "pm2" ]; then
        pm2 stop "$APP_NAME"
    else
        systemctl stop network-monitor
    fi
    
    print_success "Application stopped"
}

# Function to uninstall application
uninstall_application() {
    print_warning "This will remove the application and all its data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Uninstalling application..."
        
        if [ "$DEPLOYMENT_METHOD" = "pm2" ]; then
            pm2 stop "$APP_NAME" 2>/dev/null || true
            pm2 delete "$APP_NAME" 2>/dev/null || true
        else
            systemctl stop network-monitor 2>/dev/null || true
            systemctl disable network-monitor 2>/dev/null || true
            rm -f /etc/systemd/system/network-monitor.service
            systemctl daemon-reload
        fi
        
        rm -rf "$APP_DIR"
        print_success "Application uninstalled"
    else
        print_status "Uninstall cancelled"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env=*)
            ENVIRONMENT="${1#*=}"
            shift
            ;;
        --port=*)
            PORT="${1#*=}"
            shift
            ;;
        --user=*)
            SERVICE_USER="${1#*=}"
            shift
            ;;
        --dir=*)
            APP_DIR="${1#*=}"
            shift
            ;;
        --method=*)
            DEPLOYMENT_METHOD="${1#*=}"
            shift
            ;;
        *)
            COMMAND="$1"
            shift
            ;;
    esac
done

# Main command handling
case "${COMMAND:-help}" in
    deploy-pm2)
        DEPLOYMENT_METHOD="pm2"
        check_dependencies
        create_app_directory
        copy_application_files
        install_dependencies
        build_application
        setup_database
        deploy_pm2
        check_status
        ;;
    deploy-systemd)
        DEPLOYMENT_METHOD="systemd"
        check_root
        check_dependencies
        create_app_directory
        copy_application_files
        install_dependencies
        build_application
        setup_database
        deploy_systemd
        check_status
        ;;
    build)
        build_application
        ;;
    install-deps)
        install_dependencies
        ;;
    setup-db)
        setup_database
        ;;
    status)
        check_status
        ;;
    logs)
        view_logs
        ;;
    restart)
        restart_application
        ;;
    stop)
        stop_application
        ;;
    uninstall)
        uninstall_application
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        echo ""
        show_usage
        exit 1
        ;;
esac
