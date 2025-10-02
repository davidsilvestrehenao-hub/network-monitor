# Type Safety Guidelines

## Core Principle

**Prefer proper interfaces, use generics when necessary, and only use `any` or `unknown` when absolutely required with clear justification.**

## Type Safety Hierarchy

### 1. ✅ **Best: Proper Interfaces**

Use explicit interfaces whenever possible for maximum type safety and clear contracts.

```typescript
// ✅ Excellent: Clear, explicit interface
interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface UserRepository {
  findById(id: string): Promise<UserData | null>;
  create(data: Omit<UserData, 'id' | 'createdAt'>): Promise<UserData>;
  update(id: string, data: Partial<UserData>): Promise<UserData>;
}
```

### 2. ✅ **Good: Generics with Constraints**

Use generics when you need flexibility while maintaining type safety.

```typescript
// ✅ Good: Generic with constraints
interface Repository<T extends { id: string }, CreateDto> {
  findById(id: string): Promise<T | null>;
  create(data: CreateDto): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
}

// ✅ Good: Constrained generic function
function processEntity<T extends { id: string; name: string }>(
  entity: T
): T & { processed: boolean } {
  return { ...entity, processed: true };
}

// ✅ Good: Event handler with generic data
function handleEvent<T = unknown>(event: string, data?: T): void {
  console.log(`Event ${event}:`, data);
}
```

### 3. ⚠️ **Acceptable: `unknown` with Type Guards**

Use `unknown` when dealing with dynamic data, then use type guards for safety.

```typescript
// ⚠️ Acceptable: External API response handling
function handleApiResponse(response: unknown): UserData | null {
  // Justification: Using unknown for external API response, then type guarding
  if (
    typeof response === 'object' &&
    response !== null &&
    'id' in response &&
    'name' in response &&
    'email' in response &&
    typeof (response as { id: unknown }).id === 'string' &&
    typeof (response as { name: unknown }).name === 'string' &&
    typeof (response as { email: unknown }).email === 'string'
  ) {
    return response as UserData;
  }
  return null;
}

// ⚠️ Acceptable: Runtime property access
function getGlobalProperty(propertyName: string): unknown {
  // Justification: Using unknown for dynamic global property access
  return (globalThis as unknown as Record<string, unknown>)[propertyName];
}
```

### 4. ❌ **Last Resort: `any` (Must Be Justified)**

Only use `any` when absolutely necessary and always provide clear justification.

```typescript
// ❌ Last resort: Testing private methods
class TestHelper {
  // Justification: Using any type to access private methods for testing purposes only
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accessPrivateMethod(service: any, methodName: string): any {
    return service[methodName];
  }
}

// ❌ Last resort: Mock fetch for testing
// Justification: Using any type for global fetch mock because vitest's vi.fn() doesn't perfectly match fetch signature
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.fetch = vi.fn() as any;

// ❌ Last resort: Runtime global extensions
function getBunRuntime(): BunRuntime | null {
  if (isBunRuntime()) {
    // Justification: Using any type because Bun adds properties to globalThis that aren't in standard types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis as any).Bun;
  }
  return null;
}
```

## Common Patterns and Best Practices

### Mock Interfaces for Testing

```typescript
// ✅ Proper mock interfaces
export interface MockUserRepository {
  findById: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
}

// ✅ Generic mock factory
function createMockRepository<T>(): MockRepository<T> {
  return {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}
```

### Event Handling with Generics

```typescript
// ✅ Type-safe event handling
interface EventBus {
  on<T = unknown>(event: string, handler: (data?: T) => void): void;
  emit<T = unknown>(event: string, data?: T): void;
}

// Usage
eventBus.on<UserData>('user:created', (user) => {
  // user is typed as UserData | undefined
  console.log('User created:', user?.name);
});
```

### API Response Handling

```typescript
// ✅ Safe API response handling
async function fetchUser(id: string): Promise<UserData | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data: unknown = await response.json();
    
    return validateUserData(data);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

function validateUserData(data: unknown): UserData | null {
  if (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'email' in data
  ) {
    return data as UserData;
  }
  return null;
}
```

## Justification Guidelines

When you must use `any` or `unknown`, always include a comment explaining:

1. **Why** the type is necessary
2. **What** you've tried to avoid it
3. **When** it's safe to use

### Good Justification Examples

```typescript
// ✅ Good justification
// Justification: Using any type to access private evaluateRule method for testing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
await (alertingService as any).evaluateRule(rule, result);

// ✅ Good justification
// Justification: Using unknown for external API response, then type guarding for safety
function handleResponse(response: unknown): ProcessedData | null {
  // Type guard implementation...
}
```

### Poor Justification Examples

```typescript
// ❌ Poor justification
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response; // TODO: fix later

// ❌ No justification
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function process(data: any): any {
  return data.something;
}
```

## Code Review Checklist

When reviewing code, check for:

- [ ] Are proper interfaces used where possible?
- [ ] Are generics used appropriately for flexibility?
- [ ] Is `unknown` preferred over `any` for dynamic typing?
- [ ] Are all `any` types properly justified?
- [ ] Do type guards properly validate `unknown` data?
- [ ] Are mock interfaces properly typed?
- [ ] Are generic constraints appropriate?

## Migration Strategy

When refactoring existing `any` types:

1. **Identify the data structure** - What shape does the data actually have?
2. **Create proper interfaces** - Define explicit contracts
3. **Use generics for flexibility** - Add type parameters where needed
4. **Add type guards for `unknown`** - Validate dynamic data safely
5. **Justify remaining `any` types** - Document why they're necessary

Remember: **Type safety is not just about preventing errors—it's about making code more maintainable, self-documenting, and easier to refactor.**
