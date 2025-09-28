#!/bin/bash

# PM2 Management Commands for Network Monitor
# This script provides convenient commands for managing the PM2 application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo "PM2 Management Commands for Network Monitor"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       - Start the application"
    echo "  stop        - Stop the application"
    echo "  restart     - Restart the application"
    echo "  reload      - Reload the application (zero-downtime)"
    echo "  status      - Show application status"
    echo "  logs        - Show application logs"
    echo "  logs-follow - Follow application logs"
    echo "  monit       - Open PM2 monitoring dashboard"
    echo "  build       - Build and restart application"
    echo "  deploy      - Deploy application (production)"
    echo "  deploy-staging - Deploy application (staging)"
    echo "  cleanup     - Clean up logs and temporary files"
    echo "  health      - Check application health"
    echo "  help        - Show this help message"
}

# Function to start application
start_app() {
    print_status "Starting Network Monitor..."
    pm2 start ecosystem.config.js --env production
    print_success "Application started"
    pm2 status
}

# Function to stop application
stop_app() {
    print_status "Stopping Network Monitor..."
    pm2 stop network-monitor
    print_success "Application stopped"
}

# Function to restart application
restart_app() {
    print_status "Restarting Network Monitor..."
    pm2 restart network-monitor
    print_success "Application restarted"
    pm2 status
}

# Function to reload application
reload_app() {
    print_status "Reloading Network Monitor (zero-downtime)..."
    pm2 reload network-monitor
    print_success "Application reloaded"
    pm2 status
}

# Function to show status
show_status() {
    print_status "Network Monitor Status:"
    pm2 status
    echo ""
    print_status "System Resources:"
    pm2 monit --no-interaction
}

# Function to show logs
show_logs() {
    print_status "Network Monitor Logs:"
    pm2 logs network-monitor --lines 50
}

# Function to follow logs
follow_logs() {
    print_status "Following Network Monitor Logs (Ctrl+C to exit):"
    pm2 logs network-monitor --follow
}

# Function to open monitoring dashboard
open_monit() {
    print_status "Opening PM2 Monitoring Dashboard..."
    pm2 monit
}

# Function to build and restart
build_and_restart() {
    print_status "Building application..."
    bun run build
    print_success "Build complete"
    
    print_status "Restarting application..."
    pm2 restart network-monitor
    print_success "Application restarted with new build"
}

# Function to deploy to production
deploy_production() {
    print_status "Deploying to production..."
    pm2 deploy production
    print_success "Production deployment complete"
}

# Function to deploy to staging
deploy_staging() {
    print_status "Deploying to staging..."
    pm2 deploy staging
    print_success "Staging deployment complete"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up logs and temporary files..."
    
    # Clean old logs (keep last 7 days)
    find logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    # Clean PM2 logs
    pm2 flush
    
    # Clean build artifacts
    rm -rf dist .vinxi 2>/dev/null || true
    
    print_success "Cleanup complete"
}

# Function to check health
check_health() {
    print_status "Checking application health..."
    
    # Check if PM2 process is running
    if pm2 describe network-monitor >/dev/null 2>&1; then
        local status=$(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "unknown")
        if [ "$status" = "online" ]; then
            print_success "Application is running and healthy"
            
            # Check if application responds
            local port=$(pm2 jlist | jq -r '.[0].pm2_env.PORT' 2>/dev/null || echo "3000")
            if curl -s "http://localhost:$port" >/dev/null 2>&1; then
                print_success "Application is responding to HTTP requests"
            else
                print_warning "Application is running but not responding to HTTP requests"
            fi
        else
            print_error "Application is not running (status: $status)"
        fi
    else
        print_error "Application is not managed by PM2"
    fi
}

# Main command handling
case "${1:-help}" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    reload)
        reload_app
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    logs-follow)
        follow_logs
        ;;
    monit)
        open_monit
        ;;
    build)
        build_and_restart
        ;;
    deploy)
        deploy_production
        ;;
    deploy-staging)
        deploy_staging
        ;;
    cleanup)
        cleanup
        ;;
    health)
        check_health
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
