#!/bin/bash

# PM2 Monitoring Script for Network Monitor
# This script provides advanced monitoring and alerting capabilities

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="network-monitor"
LOG_FILE="logs/monitoring.log"
ALERT_EMAIL="admin@example.com"  # Change this to your email
MAX_MEMORY_MB=1024
MAX_CPU_PERCENT=80
CHECK_INTERVAL=30

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

# Function to log with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to check if application is running
check_app_status() {
    if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
        local status=$(pm2 jlist | jq -r ".[] | select(.name==\"$APP_NAME\") | .pm2_env.status" 2>/dev/null || echo "unknown")
        echo "$status"
    else
        echo "not_found"
    fi
}

# Function to check memory usage
check_memory_usage() {
    local memory_mb=$(pm2 jlist | jq -r ".[] | select(.name==\"$APP_NAME\") | .monit.memory" 2>/dev/null || echo "0")
    local memory_mb=$((memory_mb / 1024 / 1024))
    echo "$memory_mb"
}

# Function to check CPU usage
check_cpu_usage() {
    local cpu_percent=$(pm2 jlist | jq -r ".[] | select(.name==\"$APP_NAME\") | .monit.cpu" 2>/dev/null || echo "0")
    echo "$cpu_percent"
}

# Function to check if application responds to HTTP
check_http_response() {
    local port=$(pm2 jlist | jq -r ".[] | select(.name==\"$APP_NAME\") | .pm2_env.PORT" 2>/dev/null || echo "3000")
    if curl -s -f "http://localhost:$port" >/dev/null 2>&1; then
        echo "ok"
    else
        echo "error"
    fi
}

# Function to send alert
send_alert() {
    local message="$1"
    local severity="$2"
    
    log_message "ALERT [$severity]: $message"
    
    # You can add email notification here
    # echo "$message" | mail -s "Network Monitor Alert" "$ALERT_EMAIL"
    
    # Or send to a webhook
    # curl -X POST -H "Content-Type: application/json" -d "{\"text\":\"$message\"}" "YOUR_WEBHOOK_URL"
    
    print_error "ALERT: $message"
}

# Function to restart application if needed
restart_if_needed() {
    local status=$(check_app_status)
    
    if [ "$status" = "errored" ] || [ "$status" = "stopped" ]; then
        print_warning "Application is not running properly (status: $status). Restarting..."
        pm2 restart "$APP_NAME"
        log_message "Application restarted due to status: $status"
        
        # Wait a bit and check again
        sleep 10
        local new_status=$(check_app_status)
        if [ "$new_status" = "online" ]; then
            print_success "Application restarted successfully"
        else
            send_alert "Failed to restart application. Status: $new_status" "CRITICAL"
        fi
    fi
}

# Function to check resource usage
check_resources() {
    local memory_mb=$(check_memory_usage)
    local cpu_percent=$(check_cpu_usage)
    
    # Check memory usage
    if [ "$memory_mb" -gt "$MAX_MEMORY_MB" ]; then
        send_alert "High memory usage: ${memory_mb}MB (limit: ${MAX_MEMORY_MB}MB)" "WARNING"
    fi
    
    # Check CPU usage
    if (( $(echo "$cpu_percent > $MAX_CPU_PERCENT" | bc -l) )); then
        send_alert "High CPU usage: ${cpu_percent}% (limit: ${MAX_CPU_PERCENT}%)" "WARNING"
    fi
    
    log_message "Resources - Memory: ${memory_mb}MB, CPU: ${cpu_percent}%"
}

# Function to check HTTP response
check_http() {
    local http_status=$(check_http_response)
    
    if [ "$http_status" = "error" ]; then
        send_alert "Application is not responding to HTTP requests" "CRITICAL"
    else
        log_message "HTTP check passed"
    fi
}

# Function to generate monitoring report
generate_report() {
    local status=$(check_app_status)
    local memory_mb=$(check_memory_usage)
    local cpu_percent=$(check_cpu_usage)
    local http_status=$(check_http_response)
    local uptime=$(pm2 jlist | jq -r ".[] | select(.name==\"$APP_NAME\") | .pm2_env.pm_uptime" 2>/dev/null || echo "0")
    local restarts=$(pm2 jlist | jq -r ".[] | select(.name==\"$APP_NAME\") | .pm2_env.restart_time" 2>/dev/null || echo "0")
    
    echo "=== Network Monitor Status Report ==="
    echo "Time: $(date)"
    echo "Status: $status"
    echo "Memory Usage: ${memory_mb}MB"
    echo "CPU Usage: ${cpu_percent}%"
    echo "HTTP Response: $http_status"
    echo "Uptime: $uptime"
    echo "Restarts: $restarts"
    echo "====================================="
    
    log_message "REPORT - Status: $status, Memory: ${memory_mb}MB, CPU: ${cpu_percent}%, HTTP: $http_status"
}

# Function to start continuous monitoring
start_monitoring() {
    print_status "Starting continuous monitoring for $APP_NAME..."
    print_status "Check interval: ${CHECK_INTERVAL} seconds"
    print_status "Max memory: ${MAX_MEMORY_MB}MB"
    print_status "Max CPU: ${MAX_CPU_PERCENT}%"
    print_status "Press Ctrl+C to stop monitoring"
    
    log_message "Monitoring started"
    
    while true; do
        # Check application status
        restart_if_needed
        
        # Check resources
        check_resources
        
        # Check HTTP response
        check_http
        
        # Generate report every 10 minutes
        local current_minute=$(date +%M)
        if [ "$((current_minute % 10))" -eq 0 ]; then
            generate_report
        fi
        
        sleep "$CHECK_INTERVAL"
    done
}

# Function to show current status
show_status() {
    generate_report
}

# Function to show logs
show_logs() {
    print_status "Recent monitoring logs:"
    if [ -f "$LOG_FILE" ]; then
        tail -n 50 "$LOG_FILE"
    else
        print_warning "No monitoring logs found"
    fi
}

# Function to clear logs
clear_logs() {
    print_status "Clearing monitoring logs..."
    > "$LOG_FILE"
    print_success "Monitoring logs cleared"
}

# Main command handling
case "${1:-help}" in
    start)
        start_monitoring
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    clear-logs)
        clear_logs
        ;;
    help|--help|-h)
        echo "PM2 Monitoring Script for Network Monitor"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  start       - Start continuous monitoring"
        echo "  status      - Show current status report"
        echo "  logs        - Show recent monitoring logs"
        echo "  clear-logs  - Clear monitoring logs"
        echo "  help        - Show this help message"
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac
