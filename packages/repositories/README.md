# @network-monitor/repositories

Repository interfaces and concrete implementations for data access layer.

## Overview

This package provides a clean separation between repository abstractions and database implementations. It contains:

- **Repository Interfaces**: Abstract contracts for data access
- **Concrete Implementations**: Prisma-based repository implementations
- **Base Repository**: Common functionality for all repositories

## Architecture

```
Repository Package
├── interfaces/          # Repository interfaces (IUserRepository, etc.)
├── implementations/     # Concrete Prisma-based implementations
└── base/               # Base repository classes and utilities
```

## Key Principles

1. **Interface-First Design**: All repositories implement well-defined interfaces
2. **Database Agnostic**: Interfaces don't depend on specific database technology
3. **Domain Mapping**: Convert between database models and domain entities
4. **Type Safety**: Full TypeScript type safety throughout

## Usage

```typescript
import { IUserRepository, UserRepository } from "@network-monitor/repositories";

// Use interface for dependency injection
class UserService {
  constructor(private userRepository: IUserRepository) {}
}

// Concrete implementation uses Prisma
const userRepository = new UserRepository(prismaService, logger);
```

## Repository Pattern Benefits

- **Testability**: Easy to mock repositories for testing
- **Flexibility**: Can swap database implementations
- **Separation of Concerns**: Business logic separate from data access
- **Type Safety**: Compile-time guarantees for data operations
