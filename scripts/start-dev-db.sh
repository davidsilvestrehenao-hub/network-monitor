#!/bin/bash

# =====================================================
# Development Database Starter Script
# =====================================================
# This script starts the PostgreSQL development database
# using Docker Compose for local development.
#
# The database will be available at:
#   Host: localhost:5432
#   User: dev
#   Password: dev
#   Database: network_monitor_dev
#
# Usage:
#   ./scripts/start-dev-db.sh
#
# Additional commands:
#   ./scripts/start-dev-db.sh logs     - View database logs
#   ./scripts/start-dev-db.sh stop     - Stop the database
#   ./scripts/start-dev-db.sh reset    - Stop and remove all data
#   ./scripts/start-dev-db.sh status   - Check database status
# =====================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.dev.yml"

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

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if docker-compose file exists
check_compose_file() {
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
}

# Function to start the database
start_database() {
    print_status "Starting PostgreSQL development database..."
    
    # Check if database is already running
    if docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
        print_warning "Database is already running!"
        print_status "Database connection details:"
        echo "  Host: localhost:5432"
        echo "  User: dev"
        echo "  Password: dev"
        echo "  Database: network_monitor_dev"
        echo ""
        echo "Connection string:"
        echo "  postgresql://dev:dev@localhost:5432/network_monitor_dev"
        return 0
    fi
    
    # Start the database service
    docker-compose -f "$COMPOSE_FILE" up -d postgres
    
    print_status "Waiting for database to be ready..."
    
    # Wait for database to be healthy
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "healthy"; then
            print_success "Database is ready!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start within expected time"
            print_status "Check logs with: docker-compose -f $COMPOSE_FILE logs postgres"
            exit 1
        fi
        
        print_status "Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_success "PostgreSQL development database started successfully!"
    echo ""
    print_status "Database connection details:"
    echo "  Host: localhost:5432"
    echo "  User: dev"
    echo "  Password: dev"
    echo "  Database: network_monitor_dev"
    echo ""
    echo "Connection string:"
    echo "  postgresql://dev:dev@localhost:5432/network_monitor_dev"
    echo ""
    print_status "Useful commands:"
    echo "  View logs:    ./scripts/start-dev-db.sh logs"
    echo "  Stop:         ./scripts/start-dev-db.sh stop"
    echo "  Reset:        ./scripts/start-dev-db.sh reset"
    echo "  Status:       ./scripts/start-dev-db.sh status"
}

# Function to show database logs
show_logs() {
    print_status "Showing PostgreSQL database logs..."
    docker-compose -f "$COMPOSE_FILE" logs -f postgres
}

# Function to stop the database
stop_database() {
    print_status "Stopping PostgreSQL development database..."
    docker-compose -f "$COMPOSE_FILE" stop postgres
    print_success "Database stopped successfully!"
}

# Function to reset the database (stop and remove data)
reset_database() {
    print_warning "This will stop the database and remove all data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping and removing database..."
        docker-compose -f "$COMPOSE_FILE" down -v postgres
        print_success "Database reset successfully! All data has been removed."
    else
        print_status "Reset cancelled."
    fi
}

# Function to show database status
show_status() {
    print_status "PostgreSQL database status:"
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps postgres
    echo ""
    
    # Show connection info if running
    if docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
        print_status "Database is running and accessible at:"
        echo "  Host: localhost:5432"
        echo "  User: dev"
        echo "  Password: dev"
        echo "  Database: network_monitor_dev"
    else
        print_warning "Database is not running."
    fi
}

# Main script logic
main() {
    # Check prerequisites
    check_docker
    check_compose_file
    
    # Handle command line arguments
    case "${1:-}" in
        "logs")
            show_logs
            ;;
        "stop")
            stop_database
            ;;
        "reset")
            reset_database
            ;;
        "status")
            show_status
            ;;
        "")
            start_database
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  (no args)  Start the development database"
            echo "  logs       Show database logs"
            echo "  stop       Stop the database"
            echo "  reset      Stop and remove all data"
            echo "  status     Show database status"
            echo "  help       Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0              # Start database"
            echo "  $0 logs         # View logs"
            echo "  $0 stop         # Stop database"
            echo "  $0 reset        # Reset database (removes data)"
            echo ""
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            echo "Use '$0 help' to see available commands."
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
