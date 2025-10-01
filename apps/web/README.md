# Web Application

The Progressive Web App (PWA) frontend built with SolidStart and SolidJS.

## Overview

This is the main **user-facing web application** for the Network Monitor. It provides a beautiful, responsive UI for monitoring internet connections with real-time updates and offline capability.

## Tech Stack

- **Framework**: SolidStart (full-stack SolidJS framework)
- **UI Library**: SolidJS (reactive, performant)
- **Styling**: Tailwind CSS
- **API**: tRPC (end-to-end type-safe API)
- **Charts**: Chart.js via solid-chartjs
- **Runtime**: Bun

## Features

### Core Features

- 📊 **Real-time Dashboard** - Live monitoring status and metrics
- 🎯 **Target Management** - Add, edit, delete monitoring targets
- 🚨 **Alert Rules** - Configure custom alert thresholds
- 📈 **Performance Charts** - Historical data visualization
- 🔔 **Notifications** - In-app and push notifications
- ⚙️ **Settings** - Configure monitoring and notification preferences

### PWA Features

- 📱 **Installable** - Install as native app on any device
- 🔄 **Offline Support** - View historical data when offline
- 🎨 **Dark Mode** - Beautiful light/dark theme support
- 📲 **Push Notifications** - Receive alerts even when app is closed

## Project Structure

```
src/
├── app.tsx                 # Root app component with routing
├── components/             # Reusable UI components
│   ├── Dashboard/         # Dashboard page components
│   ├── Charts/            # Chart.js visualizations
│   ├── Layout/            # Layout components (Navbar, Sidebar)
│   ├── Modals/            # Modal dialogs
│   ├── Forms/             # Form components
│   ├── Alerts/            # Alert rule components
│   ├── Notifications/     # Notification components
│   └── Settings/          # Settings page components
├── routes/                # SolidStart file-based routing
│   ├── index.tsx          # Dashboard page
│   ├── targets.tsx        # Targets management page
│   ├── alerts.tsx         # Alerts and incidents page
│   ├── charts.tsx         # Performance charts page
│   ├── notifications.tsx  # Notifications page
│   ├── settings.tsx       # Settings page
│   └── api/trpc/          # tRPC API handler
├── server/                # Server-side code
│   └── trpc/              # tRPC router and procedures
├── lib/                   # Utilities and services
│   ├── trpc.ts            # tRPC client setup
│   ├── frontend/          # Frontend DI container
│   └── hooks/             # SolidJS hooks
└── app.css                # Global styles
```

## Running

```bash
# Development mode with hot reload
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Linting and formatting
bun run lint
bun run format
bun run type-check
```

## API Layer

The web app serves a **tRPC API** that the frontend consumes. All API procedures are defined in `src/server/trpc/routers/`.

### tRPC Routers

- `targets` - Target CRUD and monitoring operations
- `speedTests` - Speed test execution and results
- `alertRules` - Alert rule management
- `incidents` - Incident event management
- `notifications` - Notification operations
- `pushSubscriptions` - Push subscription management
- `users` - User profile operations

See [TRPC-API-REFERENCE.md](./TRPC-API-REFERENCE.md) for complete API documentation.

## Frontend Architecture

- **DI Container**: Frontend services use a lightweight DI container
- **Event-Driven**: Uses EventBus for component communication
- **Type-Safe**: Full TypeScript with tRPC type inference
- **Reactive**: SolidJS signals for efficient reactivity

## Configuration

The web app initializes the backend DI container automatically using the config at `configs/service-config.json`.

## Building for Production

```bash
# Build optimized production bundle
bun run build

# Output is in .output/ directory
# Deploy with: bun run .output/server/index.mjs
```

## Environment Variables

```env
# Database
DATABASE_URL=file:./prisma/dev.db

# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

## Dependencies

### Production

- `@solidjs/start` - SolidStart framework
- `solid-js` - SolidJS reactive framework
- `@trpc/client` - tRPC client
- `@trpc/server` - tRPC server
- `chart.js` - Charts and visualizations
- `solid-chartjs` - SolidJS Chart.js wrapper
- `tailwindcss` - Utility-first CSS framework
- `zod` - Schema validation

### Workspace Dependencies

- `@network-monitor/shared` - Shared interfaces and types
- `@network-monitor/infrastructure` - Backend services and DI
- `@network-monitor/database` - Database access layer
