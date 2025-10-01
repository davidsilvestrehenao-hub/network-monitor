# PM2 Setup Guide for Network Monitor

This guide explains how to set up and manage the PWA Connection Monitor using PM2 for production deployment with automatic restarts and system reboot survival.

## 🚀 Quick Start

### 1. Install PM2 (if not already installed)

```bash
# Install PM2 globally
npm install -g pm2
# or
bun add -g pm2
```text

### 2. Run the Setup Script

```bash
# Run the automated setup script
bun run pm2:setup
```text

This script will:

- Install dependencies
- Build the application
- Set up the database
- Configure PM2
- Start the application
- Set up auto-start on system reboot

## 📋 Manual Setup

If you prefer to set up PM2 manually:

### 1. Install Dependencies

```bash
bun install
```text

### 2. Build the Application

```bash
bun run build
```text

### 3. Set up Database

```bash
bun run push
```text

### 4. Start with PM2

```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set up auto-start on system reboot
pm2 startup
```text

## 🔧 Configuration Files

### Ecosystem Configuration

The `ecosystem.config.js` file contains the PM2 configuration:

- **Application Name**: `network-monitor`
- **Script**: Uses Bun to run the application
- **Instances**: 1 (single instance)
- **Auto-restart**: Enabled
- **Memory Limit**: 1GB
- **Logging**: Configured with separate files for output and errors
- **Environment Variables**: Production, development, and staging configs

### Environment Variables

The configuration supports multiple environments:

- **Production**: `NODE_ENV=production`, `PORT=3000`
- **Development**: `NODE_ENV=development`, `PORT=3000`
- **Staging**: `NODE_ENV=staging`, `PORT=3001`

## 📊 Management Commands

### Basic Commands

```bash
# Start application
bun run pm2:start

# Stop application
bun run pm2:stop

# Restart application
bun run pm2:restart

# Reload application (zero-downtime)
bun run pm2:reload

# Check status
bun run pm2:status

# View logs
bun run pm2:logs

# Open monitoring dashboard
bun run pm2:monit
```text

### Advanced Commands

```bash
# Build and restart
bun run pm2:build

# Health check
bun run pm2:health

# Cleanup logs
bun run pm2:cleanup

# Delete application from PM2
bun run pm2:delete
```text

### Using the Management Script

```bash
# Use the comprehensive management script
bun run pm2:commands [COMMAND]

# Available commands:
# start, stop, restart, reload, status, logs, logs-follow
# monit, build, deploy, deploy-staging, cleanup, health
```text

## 📈 Monitoring

### Continuous Monitoring

```bash
# Start continuous monitoring
bun run pm2:monitoring start

# Check current status
bun run pm2:monitoring status

# View monitoring logs
bun run pm2:monitoring logs
```text

### Monitoring Features

- **Health Checks**: Automatic HTTP health checks
- **Resource Monitoring**: Memory and CPU usage tracking
- **Auto-restart**: Automatic restart on failures
- **Alerting**: Configurable alerts for high resource usage
- **Logging**: Comprehensive logging with rotation

## 🔄 Deployment

### Production Deployment

```bash
# Deploy to production
bun run pm2:deploy:prod
```text

### Staging Deployment

```bash
# Deploy to staging
bun run pm2:deploy:staging
```text

### Manual Deployment

```bash
# Build and restart
bun run pm2:build

# Or use PM2 directly
pm2 reload network-monitor
```text

## 📁 File Structure

```text
network-monitor/
├── ecosystem.config.js          # PM2 configuration
├── pm2.config.json             # Alternative JSON config
├── scripts/
│   ├── pm2-setup.sh            # Automated setup script
│   ├── pm2-commands.sh         # Management commands
│   └── pm2-monitoring.sh       # Monitoring script
├── logs/                       # Application logs
│   ├── combined.log
│   ├── out.log
│   └── error.log
└── PM2-SETUP.md               # This guide
```text

## 🛠️ Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs network-monitor

# Restart application
pm2 restart network-monitor
```text

#### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart if needed
pm2 restart network-monitor
```text

#### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in ecosystem.config.js
```text

### Log Management

```bash
# View recent logs
pm2 logs network-monitor --lines 100

# Follow logs in real-time
pm2 logs network-monitor --follow

# Clear logs
pm2 flush
```text

### System Reboot Issues

```bash
# Re-setup startup script
pm2 startup

# Save current configuration
pm2 save

# Check if startup is configured
pm2 unstartup
pm2 startup
```text

## 🔒 Security Considerations

### Environment Variables

- Store sensitive data in environment variables
- Use different configurations for different environments
- Never commit secrets to version control

### Process Management

- Run PM2 as a non-root user when possible
- Use process managers like systemd for additional security
- Monitor resource usage to prevent abuse

### Log Security

- Rotate logs regularly
- Monitor logs for suspicious activity
- Use log aggregation services for production

## 📊 Performance Optimization

### Memory Management

- Monitor memory usage with `pm2 monit`
- Set appropriate memory limits in configuration
- Use `max_memory_restart` to prevent memory leaks

### CPU Optimization

- Monitor CPU usage
- Consider clustering for CPU-intensive applications
- Use `exec_mode: "cluster"` for better CPU utilization

### Log Optimization

- Use log rotation to prevent disk space issues
- Monitor log file sizes
- Use structured logging for better analysis

## 🔄 Backup and Recovery

### Configuration Backup

```bash
# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 ./backup/

# Restore configuration
pm2 resurrect
```text

### Application Backup

```bash
# Backup application files
tar -czf network-monitor-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=logs \
  --exclude=.git \
  .
```text

## 📞 Support

### Getting Help

- Check PM2 documentation: <https://pm2.keymetrics.io/docs/>
- Review application logs for errors
- Use monitoring tools to identify issues
- Check system resources and performance

### Useful Resources

- PM2 GitHub: <https://github.com/Unitech/pm2>
- PM2 Documentation: <https://pm2.keymetrics.io/docs/>
- Bun Documentation: <https://bun.sh/docs>

## ✅ Checklist

### Initial Setup

- [ ] PM2 installed globally
- [ ] Dependencies installed (`bun install`)
- [ ] Application built (`bun run build`)
- [ ] Database set up (`bun run push`)
- [ ] PM2 configuration created
- [ ] Application started with PM2
- [ ] PM2 configuration saved
- [ ] Auto-start configured

### Production Readiness

- [ ] Environment variables configured
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Health checks working
- [ ] Auto-restart configured
- [ ] Resource limits set
- [ ] Security measures in place
- [ ] Backup strategy implemented

### Maintenance

- [ ] Regular log rotation
- [ ] Resource monitoring
- [ ] Performance optimization
- [ ] Security updates
- [ ] Configuration backups
- [ ] Health check monitoring

Remember: **PM2 ensures your application runs reliably and survives system reboots. Regular monitoring and maintenance are essential for production deployments.**
