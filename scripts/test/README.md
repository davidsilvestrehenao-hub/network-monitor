# Test Scripts

This directory contains various test scripts for the Network Monitor application.

## Available Test Scripts

- `test-api.js` - Basic API endpoint testing
- `test-api-endpoints.js` - Extended API endpoint testing with detailed output
- `test-api-extended.js` - Comprehensive API testing with multiple scenarios
- `test-prpc-api.js` - Tests the pRPC API endpoints
- `test-server.js` - Simple test server to verify core application functionality

## Running Tests

```bash
# Run individual test scripts
bun run scripts/test/test-api.js
bun run scripts/test/test-api-endpoints.js
bun run scripts/test/test-server.js

# Run all test scripts
bun run test:all
```

## Test Script Purposes

- **API Tests**: Verify that all API endpoints are working correctly
- **Server Tests**: Ensure the core application starts and runs properly
- **Integration Tests**: Test the interaction between different components

## Prerequisites

Make sure the application is built and the database is set up before running these tests:

```bash
bun run build
bun run push
```
