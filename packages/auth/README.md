# @network-monitor/auth

Authentication and user management services.

## Overview

This package contains authentication services including a production `AuthService` and a `MockAuth` for development and testing.

## Exports

```typescript
import { AuthService, MockAuth } from "@network-monitor/auth";
```

## AuthService

Production authentication service that implements `IAuthService`.

### Responsibilities

- **User Authentication**: Login and registration
- **Session Management**: Create, validate, and refresh sessions
- **Profile Management**: Update user profiles
- **Account Management**: Delete user accounts
- **Event Handling**: Listen for auth-related events

### Key Methods

```typescript
// Authentication
login(credentials: LoginCredentials): Promise<AuthResult>
register(data: RegisterData): Promise<AuthResult>
logout(sessionToken: string): Promise<void>

// Session management
validateSession(sessionToken: string): Promise<User | null>
refreshSession(sessionToken: string): Promise<AuthResult | null>
getActiveSessions(): Promise<Array<SessionInfo>>

// Profile management
updateProfile(userId: string, data: UpdateUserData): Promise<User>
deleteAccount(userId: string): Promise<void>

// Interface compliance
getSession(): Promise<AuthSession | null>
signIn(email: string, password: string): Promise<AuthSession | null>
signUp(email: string, password: string, name?: string): Promise<AuthSession | null>
signOut(): Promise<void>
getCurrentUser(): Promise<User | null>
isAuthenticated(): Promise<boolean>
```

## MockAuth

Simplified mock authentication for development and testing.

### Features

- ✅ Pre-seeded mock users
- ✅ No password validation (dev only!)
- ✅ In-memory session storage
- ✅ Full IAuthService interface compliance
- ✅ Helper methods for testing

### Usage

```typescript
import { MockAuth } from "@network-monitor/auth";

const mockAuth = new MockAuth(logger);

// Sign in with any credentials
const session = await mockAuth.signIn("mock@example.com", "any-password");

// Access mock-specific methods
const users = mockAuth.getMockUsers();
mockAuth.addMockUser(customUser);
mockAuth.setMockSession(customSession);
```

## Dependencies

Requires:
- `IUserRepository` - User data access
- `IEventBus` - Event-driven communication
- `ILogger` - Logging

These are injected via the DI container.

## Event-Driven Architecture

### Listens To:
- `USER_LOGIN_REQUESTED`
- `USER_REGISTER_REQUESTED`
- `USER_LOGOUT_REQUESTED`

### Emits:
- `USER_LOGGED_IN`
- `USER_REGISTERED`
- `USER_LOGGED_OUT`
- `SESSION_REFRESHED`
- `USER_PROFILE_UPDATED`
- `USER_ACCOUNT_DELETED`

## Configuration

Configure which auth service to use in your JSON config:

```json
{
  "services": {
    "IAuthService": {
      "module": "@network-monitor/auth",
      "className": "MockAuth",  // or "AuthService"
      "isMock": true,
      "description": "Mock authentication for development"
    }
  }
}
```

## Security Notes

⚠️ **Important**: The current `AuthService` is a basic implementation. For production use:

1. Add password hashing (bcrypt, argon2)
2. Implement CSRF protection
3. Add rate limiting for auth endpoints
4. Use secure session storage (Redis, database)
5. Implement OAuth providers (Google, GitHub, etc.)
6. Add 2FA support
7. Implement proper token refresh flow

## Testing

```bash
# Run tests
bun test

# Type checking
bun run type-check

# Linting
bun run lint
```

## Building

```bash
# Build TypeScript
bun run build

# Watch mode for development
bun run dev
```

