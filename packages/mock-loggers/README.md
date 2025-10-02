# @network-monitor/mock-loggers

Mock logger implementations for development and testing.

## Overview

This package contains mock implementations of logger components for development and testing scenarios.

## Components

### Logging
- `MockLogger` - Silent logger that captures logs for testing without console output

## Usage

```typescript
import { MockLogger } from "@network-monitor/mock-loggers";

const logger = new MockLogger();
logger.info("This will be captured but not logged to console");
```

## Architecture

Mock logger components mirror their real counterparts but with simplified implementations suitable for development and testing environments.
