#!/bin/bash

# PM2 Setup Script for Network Monitor
# This script sets up PM2 for the PWA Connection Monitor

set -e

echo "🚀 Setting up PM2 for Network Monitor..."

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

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Please install PM2 first:"
    echo "npm install -g pm2"
    echo "or"
    echo "bun add -g pm2"
    exit 1
fi

print_success "PM2 is installed"

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed. Please install Bun first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

print_success "Bun is installed"

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs
print_success "Logs directory created"

# Install dependencies
print_status "Installing dependencies..."
bun install
print_success "Dependencies installed"

# Build the application
print_status "Building application..."
bun run build
print_success "Application built"

# Setup database
print_status "Setting up database..."
bun run push
print_success "Database setup complete"

# Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop network-monitor 2>/dev/null || true
pm2 delete network-monitor 2>/dev/null || true
print_success "Existing processes stopped"

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production
print_success "Application started with PM2"

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save
print_success "PM2 configuration saved"

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup
print_success "PM2 startup script configured"

# Show PM2 status
print_status "PM2 Status:"
pm2 status

# Show logs
print_status "Recent logs:"
pm2 logs network-monitor --lines 10

print_success "PM2 setup complete! 🎉"
print_status "Useful commands:"
echo "  pm2 status                    - Check application status"
echo "  pm2 logs network-monitor      - View logs"
echo "  pm2 restart network-monitor   - Restart application"
echo "  pm2 stop network-monitor      - Stop application"
echo "  pm2 monit                     - Monitor application"
echo "  pm2 reload network-monitor    - Reload application (zero-downtime)"
