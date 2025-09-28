# Quick Start: PM2 Setup for Network Monitor

## 🚀 One-Command Setup

```bash
# Install PM2 and set up everything automatically
bun run pm2:setup
```

This single command will:

- Install PM2 if not already installed
- Build the application
- Set up the database
- Configure PM2
- Start the application
- Set up auto-start on system reboot

## 📋 Manual Setup (Step by Step)

### 1. Install PM2

```bash
npm install -g pm2
# or
bun add -g pm2
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Build Application

```bash
bun run build
```

### 4. Setup Database

```bash
bun run push
```

### 5. Start with PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🔧 Management Commands

### Basic Operations

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
```

### Advanced Operations

```bash
# Build and restart
bun run pm2:build

# Health check
bun run pm2:health

# Cleanup logs
bun run pm2:cleanup

# Delete from PM2
bun run pm2:delete
```

### Using Management Script

```bash
# Comprehensive management
bun run pm2:commands [COMMAND]

# Available commands:
# start, stop, restart, reload, status, logs, logs-follow
# monit, build, deploy, deploy-staging, cleanup, health
```

## 📊 Monitoring

### Start Continuous Monitoring

```bash
bun run pm2:monitoring start
```

### Check Status

```bash
bun run pm2:monitoring status
```

### View Monitoring Logs

```bash
bun run pm2:monitoring logs
```

## 🚀 Production Deployment

### PM2 Deployment

```bash
bun run deploy:pm2
```

### Systemd Deployment (Linux)

```bash
sudo bun run deploy:systemd
```

## 🔍 Troubleshooting

### Check Status

```bash
bun run pm2:status
```

### View Logs

```bash
bun run pm2:logs
```

### Restart if Stuck

```bash
bun run pm2:restart
```

### Check Health

```bash
bun run pm2:health
```

## 📁 Configuration Files

- `ecosystem.config.js` - PM2 configuration
- `pm2.config.json` - Alternative JSON config
- `scripts/pm2-setup.sh` - Automated setup
- `scripts/pm2-commands.sh` - Management commands
- `scripts/pm2-monitoring.sh` - Monitoring script
- `scripts/deploy.sh` - Deployment script

## ✅ Verification

After setup, verify everything is working:

1. **Check PM2 Status**

   ```bash
   bun run pm2:status
   ```

2. **Check Application Health**

   ```bash
   bun run pm2:health
   ```

3. **View Logs**

   ```bash
   bun run pm2:logs
   ```

4. **Test Auto-restart**
   ```bash
   # Kill the process and watch it restart
   pm2 kill network-monitor
   # Wait a few seconds, then check status
   bun run pm2:status
   ```

## 🎯 Key Benefits

- ✅ **Auto-restart** on crashes
- ✅ **Survives system reboots**
- ✅ **Zero-downtime reloads**
- ✅ **Resource monitoring**
- ✅ **Log management**
- ✅ **Health checks**
- ✅ **Easy management**

## 📞 Need Help?

- Check the full documentation: `PM2-SETUP.md`
- View application logs: `bun run pm2:logs`
- Check PM2 status: `bun run pm2:status`
- Use monitoring: `bun run pm2:monitoring start`

Your Network Monitor is now running with PM2 and will survive system reboots! 🎉
