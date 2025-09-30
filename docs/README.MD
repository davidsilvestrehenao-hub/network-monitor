# Network Monitor Documentation

This directory contains all documentation for the Network Monitor PWA project.

## Documentation Files

- `README.MD` - Main project README
- `CONFIGURATION.md` - Configuration management guide
- `LOGGING-IMPLEMENTATION.md` - Logging system documentation
- `PM2-SETUP.md` - PM2 process manager setup guide
- `QUICK-START-PM2.md` - Quick start guide for PM2 deployment

**Note**: `AGENTS.md` is located in the root directory for Cursor agents to find it.

## Quick Links

- [Main README](./README.MD) - Start here for project overview
- [Configuration Guide](./CONFIGURATION.md) - Learn about service configuration
- [PM2 Setup](./PM2-SETUP.md) - Production deployment with PM2
- [AI Agents](../AGENTS.md) - Understanding the AI agent system (in root directory)

## Project Structure

The Network Monitor is a PWA built with:
- **Frontend**: SolidJS + SolidStart
- **Backend**: PRPC + Prisma
- **Runtime**: Bun
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Process Manager**: PM2

## Getting Started

1. Read the [Main README](./README.MD)
2. Follow the [Configuration Guide](./CONFIGURATION.md)
3. Set up PM2 for production: [PM2 Setup](./PM2-SETUP.md)