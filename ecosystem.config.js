module.exports = {
  apps: [
    {
      name: "network-monitor",
      script: "bun",
      args: "run start",
      cwd: "/Users/david/Documents/Projects/network-monitor",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
        LOG_LEVEL: "info",
        DATABASE_URL: "file:./prisma/prod.db",
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
        HOST: "0.0.0.0",
        LOG_LEVEL: "debug",
        DATABASE_URL: "file:./prisma/dev.db",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
        LOG_LEVEL: "info",
        DATABASE_URL: "file:./prisma/prod.db",
      },
      // PM2 specific configurations
      exec_mode: "fork",
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",

      // Logging configuration
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,

      // Process management
      merge_logs: true,
      time: true,

      // Environment-specific database URLs
      env_staging: {
        NODE_ENV: "staging",
        PORT: 3001,
        HOST: "0.0.0.0",
        LOG_LEVEL: "info",
        DATABASE_URL: "file:./prisma/staging.db",
      },
    },
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: "deploy",
      host: ["your-server.com"],
      ref: "origin/main",
      repo: "git@github.com:your-username/network-monitor.git",
      path: "/var/www/network-monitor",
      "pre-deploy-local": "",
      "post-deploy":
        "bun install && bun run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "mkdir -p /var/www/network-monitor/logs",
    },
    staging: {
      user: "deploy",
      host: ["staging-server.com"],
      ref: "origin/develop",
      repo: "git@github.com:your-username/network-monitor.git",
      path: "/var/www/network-monitor-staging",
      "post-deploy":
        "bun install && bun run build && pm2 reload ecosystem.config.js --env staging",
      "pre-setup": "mkdir -p /var/www/network-monitor-staging/logs",
    },
  },
};
