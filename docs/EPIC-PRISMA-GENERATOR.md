# Epic: Custom Prisma Generator for TypeScript Code Scaffolding

## 🎯 **Epic Overview**

**Epic Title**: Implement Custom Prisma Generator for Automated TypeScript Code Scaffolding

**Epic Description**: Create a custom Prisma generator that automatically generates TypeScript boilerplate code (repositories, services, DTOs, interfaces) based on the Prisma schema models. This will eliminate manual code creation, ensure consistency across the codebase, and accelerate development when database schema changes occur.

**Business Value**:

- **Developer Productivity**: Reduce manual boilerplate creation by 80%
- **Code Consistency**: Ensure all generated code follows project patterns
- **Schema Synchronization**: Automatically update code when schema changes
- **Quality Assurance**: Generated code follows all project standards and patterns

**Epic Priority**: High
**Epic Size**: Large (8-13 story points)
**Target Sprint**: Sprint 15-16

---

## 📋 **Epic Acceptance Criteria**

### **Must Have**

- [ ] Custom Prisma generator that reads schema.prisma and generates TypeScript files
- [ ] Generated repositories implement existing ISimpleRepository patterns
- [ ] Generated services implement existing IService patterns  
- [ ] Generated DTOs follow project naming conventions
- [ ] Generated interfaces extend appropriate base interfaces
- [ ] Generator integrates with existing `bun run db:generate` command
- [ ] All generated code passes TypeScript compilation
- [ ] All generated code passes ESLint validation
- [ ] Generated code follows project formatting standards

### **Should Have**

- [ ] Template-based generation system for easy customization
- [ ] Support for all existing Prisma model patterns in the schema
- [ ] Generated mock implementations for testing
- [ ] Configuration options for customizing output
- [ ] Proper error handling and validation

### **Could Have**

- [ ] AST-based code generation for complex scenarios
- [ ] Integration with existing service wiring configurations
- [ ] Automatic import statement generation
- [ ] Support for custom field mappings

---

## 🏗️ **Technical Architecture**

### **Generator Structure**

```text
packages/prisma-generator/
├── src/
│   ├── generator.ts           # Main generator entry point
│   ├── templates/             # Code generation templates
│   │   ├── repository.ts.hbs  # Repository template
│   │   ├── service.ts.hbs     # Service template
│   │   ├── dto.ts.hbs         # DTO template
│   │   └── interface.ts.hbs   # Interface template
│   ├── mappers/               # Type mapping utilities
│   │   ├── prisma-to-ts.ts    # Prisma to TypeScript type mapping
│   │   └── field-mapper.ts    # Field mapping utilities
│   ├── generators/            # Specific code generators
│   │   ├── repository-generator.ts
│   │   ├── service-generator.ts
│   │   ├── dto-generator.ts
│   │   └── interface-generator.ts
│   └── utils/                 # Utility functions
│       ├── file-writer.ts     # File writing utilities
│       ├── naming.ts          # Naming convention utilities
│       └── validation.ts      # Validation utilities
├── templates/                 # Handlebars templates
├── package.json
├── tsconfig.json
└── README.md
```

### **Integration Points**

- **Prisma Schema**: Reads from `packages/database/prisma/schema.prisma`
- **Output Directories**:
  - Repositories: `packages/repositories/src/generated/`
  - Services: `packages/services/src/generated/`
  - Interfaces: `packages/shared/src/interfaces/generated/`
  - DTOs: `packages/shared/src/types/generated/`
- **Build Process**: Integrates with existing `db:generate` command

---

## 📚 **User Stories**

### **Story 1: Generator Foundation**

**As a** developer  
**I want** a custom Prisma generator that can read the schema and generate basic TypeScript files  
**So that** I can automate boilerplate code creation  

**Acceptance Criteria:**

- [ ] Generator script created with `@prisma/generator-helper`
- [ ] Generator reads DMMF from Prisma schema
- [ ] Generator can create output directories
- [ ] Generator integrates with `prisma generate` command
- [ ] Basic file generation works for one model

**Tasks:**

- [ ] Install `@prisma/generator-helper` dependency
- [ ] Create generator package structure
- [ ] Implement basic generator handler
- [ ] Add generator block to schema.prisma
- [ ] Test basic file generation

**Story Points**: 3  
**Priority**: Must Have

---

### **Story 2: Repository Generation**

**As a** developer  
**I want** the generator to create repository classes that implement our ISimpleRepository pattern  
**So that** all repositories follow consistent patterns and interfaces  

**Acceptance Criteria:**

- [ ] Generated repositories extend appropriate base interfaces
- [ ] Generated repositories implement all required methods
- [ ] Generated repositories include proper imports
- [ ] Generated repositories handle user-owned entities correctly
- [ ] Generated repositories include proper error handling

**Tasks:**

- [ ] Create repository template with Handlebars
- [ ] Implement repository generator logic
- [ ] Add Prisma to TypeScript type mapping
- [ ] Handle user-owned vs non-user-owned entities
- [ ] Generate proper import statements
- [ ] Test with existing models

**Story Points**: 5  
**Priority**: Must Have

---

### **Story 3: Service Generation**

**As a** developer  
**I want** the generator to create service classes that implement our IService pattern  
**So that** all services follow consistent business logic patterns  

**Acceptance Criteria:**

- [ ] Generated services extend appropriate base interfaces
- [ ] Generated services implement CRUD operations
- [ ] Generated services include event emission patterns
- [ ] Generated services handle dependency injection
- [ ] Generated services include proper error handling

**Tasks:**

- [ ] Create service template with Handlebars
- [ ] Implement service generator logic
- [ ] Handle different service interface types
- [ ] Generate dependency injection patterns
- [ ] Add event emission patterns
- [ ] Test with existing service patterns

**Story Points**: 5  
**Priority**: Must Have

---

### **Story 4: DTO and Interface Generation**

**As a** developer  
**I want** the generator to create DTOs and interfaces for all models  
**So that** I have type-safe data transfer objects and consistent interfaces  

**Acceptance Criteria:**

- [ ] Generated DTOs include Create and Update variants
- [ ] Generated DTOs handle optional fields correctly
- [ ] Generated interfaces extend base interfaces
- [ ] Generated types follow project naming conventions
- [ ] Generated code includes proper JSDoc comments

**Tasks:**

- [ ] Create DTO templates for Create/Update operations
- [ ] Create interface templates
- [ ] Implement DTO generator logic
- [ ] Handle optional vs required fields
- [ ] Generate proper type exports
- [ ] Add JSDoc documentation generation

**Story Points**: 3  
**Priority**: Must Have

---

### **Story 5: Mock Generation**

**As a** developer  
**I want** the generator to create mock implementations for testing  
**So that** I have consistent test doubles for all generated code  

**Acceptance Criteria:**

- [ ] Generated mocks implement repository interfaces
- [ ] Generated mocks include realistic test data
- [ ] Generated mocks support seeding methods
- [ ] Generated mocks follow existing mock patterns
- [ ] Generated mocks include proper TypeScript types

**Tasks:**

- [ ] Create mock repository templates
- [ ] Create mock service templates
- [ ] Implement mock generator logic
- [ ] Add test data generation
- [ ] Create seeding methods
- [ ] Test mock implementations

**Story Points**: 3  
**Priority**: Should Have

---

### **Story 6: Template System Enhancement**

**As a** developer  
**I want** a flexible template system for customizing generated code  
**So that** I can adapt the generator to different patterns and requirements  

**Acceptance Criteria:**

- [ ] Handlebars template system implemented
- [ ] Templates support conditional logic
- [ ] Templates support loops and iterations
- [ ] Templates include helper functions
- [ ] Templates are easily customizable

**Tasks:**

- [ ] Implement Handlebars template engine
- [ ] Create template helper functions
- [ ] Add conditional generation logic
- [ ] Create template customization options
- [ ] Document template system usage

**Story Points**: 2  
**Priority**: Should Have

---

### **Story 7: Configuration and Customization**

**As a** developer  
**I want** configuration options for the generator  
**So that** I can customize output paths, naming conventions, and generation options  

**Acceptance Criteria:**

- [ ] Generator accepts configuration options
- [ ] Output paths are configurable
- [ ] Naming conventions are customizable
- [ ] Generation can be selective (only certain models)
- [ ] Configuration is well-documented

**Tasks:**

- [ ] Implement configuration parsing
- [ ] Add output path configuration
- [ ] Add naming convention options
- [ ] Add selective generation options
- [ ] Create configuration documentation

**Story Points**: 2  
**Priority**: Should Have

---

### **Story 8: Integration and Testing**

**As a** developer  
**I want** the generator to integrate seamlessly with the existing build process  
**So that** generated code is always up-to-date with schema changes  

**Acceptance Criteria:**

- [ ] Generator runs as part of `bun run db:generate`
- [ ] Generated code passes all quality checks
- [ ] Generated code integrates with existing DI container
- [ ] Generated code works with existing service wiring
- [ ] Comprehensive test coverage for generator

**Tasks:**

- [ ] Integrate with existing build scripts
- [ ] Add quality check validation
- [ ] Test DI container integration
- [ ] Test service wiring integration
- [ ] Create comprehensive test suite
- [ ] Add CI/CD integration

**Story Points**: 3  
**Priority**: Must Have

---

## 🔧 **Implementation Details**

### **Prisma Schema Configuration**

```prisma
generator client {
  provider = "prisma-client-js"
}

generator custom_scaffolder {
  provider = "bun ./packages/prisma-generator/src/generator.ts"
  output   = "../generated"
  
  // Configuration options
  repositoryOutput = "../repositories/src/generated"
  serviceOutput    = "../services/src/generated"
  interfaceOutput  = "../shared/src/interfaces/generated"
  dtoOutput        = "../shared/src/types/generated"
  mockOutput       = "../mock-repositories/src/generated"
  
  // Generation options
  generateRepositories = true
  generateServices     = true
  generateInterfaces   = true
  generateDTOs         = true
  generateMocks        = true
}
```

### **Type Mapping Strategy**

```typescript
const PRISMA_TO_TYPESCRIPT_MAPPING = {
  String: 'string',
  Int: 'number',
  Float: 'number',
  Decimal: 'number',
  Boolean: 'boolean',
  DateTime: 'Date',
  Json: 'Record<string, unknown>',
  Bytes: 'Buffer',
} as const;
```

### **Generated File Examples**

**Repository Example:**

```typescript
// Generated by Custom Prisma Generator
import type { IMonitoringTargetRepository } from '@network-monitor/shared';
import type { MonitoringTarget, CreateMonitoringTargetData, UpdateMonitoringTargetData } from '@network-monitor/shared';
import type { IDatabaseService } from '@network-monitor/shared';

export class MonitoringTargetRepository implements IMonitoringTargetRepository {
  constructor(private databaseService: IDatabaseService) {}

  async findById(id: string): Promise<MonitoringTarget | null> {
    // Generated implementation
  }

  async create(data: CreateMonitoringTargetData): Promise<MonitoringTarget> {
    // Generated implementation
  }

  // ... other methods
}
```

**Service Example:**

```typescript
// Generated by Custom Prisma Generator
import type { IMonitoringTargetService } from '@network-monitor/shared';
import type { MonitoringTarget, CreateMonitoringTargetData, UpdateMonitoringTargetData } from '@network-monitor/shared';
import type { IMonitoringTargetRepository, IEventBus, ILogger } from '@network-monitor/shared';

export class MonitoringTargetService implements IMonitoringTargetService {
  constructor(
    private repository: IMonitoringTargetRepository,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  async create(data: CreateMonitoringTargetData): Promise<MonitoringTarget> {
    // Generated implementation with event emission
  }

  // ... other methods
}
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**

- [ ] Test type mapping functions
- [ ] Test template rendering
- [ ] Test file generation logic
- [ ] Test configuration parsing
- [ ] Test error handling

### **Integration Tests**

- [ ] Test full generator pipeline
- [ ] Test generated code compilation
- [ ] Test generated code with existing patterns
- [ ] Test DI container integration
- [ ] Test service wiring integration

### **End-to-End Tests**

- [ ] Test complete schema-to-code generation
- [ ] Test generated code in real application
- [ ] Test build process integration
- [ ] Test quality check compliance

---

## 📈 **Success Metrics**

### **Development Metrics**

- **Code Generation Speed**: < 5 seconds for full schema
- **Generated Code Quality**: 100% TypeScript compilation success
- **Generated Code Standards**: 100% ESLint compliance
- **Test Coverage**: > 90% for generator code

### **Developer Experience Metrics**

- **Boilerplate Reduction**: 80% reduction in manual code creation
- **Schema Change Response**: < 1 minute from schema change to updated code
- **Developer Satisfaction**: Positive feedback on ease of use
- **Bug Reduction**: 50% reduction in boilerplate-related bugs

---

## 🚀 **Deployment Plan**

### **Phase 1: Foundation (Sprint 15)**

- Implement basic generator infrastructure
- Create repository generation
- Basic integration with build process

### **Phase 2: Core Features (Sprint 16)**

- Add service generation
- Add DTO and interface generation
- Implement template system

### **Phase 3: Enhancement (Sprint 17)**

- Add mock generation
- Add configuration options
- Comprehensive testing and documentation

### **Phase 4: Production (Sprint 18)**

- Full integration with CI/CD
- Performance optimization
- Production deployment

---

## 🔗 **Dependencies**

### **Technical Dependencies**

- `@prisma/generator-helper` package
- Handlebars template engine
- Existing project architecture patterns
- TypeScript compilation pipeline

### **Process Dependencies**

- Schema design finalization
- Existing interface patterns documentation
- CI/CD pipeline updates
- Team training on generator usage

---

## 📚 **Documentation Requirements**

### **Developer Documentation**

- [ ] Generator architecture overview
- [ ] Template customization guide
- [ ] Configuration options reference
- [ ] Troubleshooting guide

### **User Documentation**

- [ ] Quick start guide
- [ ] Usage examples
- [ ] Best practices
- [ ] Migration guide from manual code

---

## 🎯 **Definition of Done**

### **Epic Completion Criteria**

- [ ] All user stories completed and accepted
- [ ] Generator produces working code for all schema models
- [ ] Generated code passes all quality checks
- [ ] Generator integrates with existing build process
- [ ] Comprehensive test coverage achieved
- [ ] Documentation complete and reviewed
- [ ] Team training completed
- [ ] Production deployment successful

### **Quality Gates**

- [ ] All generated code compiles without errors
- [ ] All generated code passes ESLint validation
- [ ] All generated code follows project formatting
- [ ] Generator performance meets requirements
- [ ] No regressions in existing functionality

---

## 🔄 **Future Enhancements**

### **Phase 2 Features**

- **AST-Based Generation**: More sophisticated code generation using TypeScript AST
- **Custom Field Mappings**: Support for custom field type mappings
- **Incremental Generation**: Only regenerate changed models
- **Plugin System**: Extensible plugin architecture for custom generators

### **Phase 3 Features**

- **GraphQL Schema Generation**: Generate GraphQL schemas from Prisma models
- **API Route Generation**: Generate tRPC routes from services
- **Frontend Component Generation**: Generate frontend components for CRUD operations
- **Migration Assistance**: Help migrate existing manual code to generated code

---

## 📞 **Stakeholders**

### **Primary Stakeholders**

- **Development Team**: Primary users of the generator
- **Tech Lead**: Architecture and pattern compliance
- **DevOps Team**: CI/CD integration and deployment

### **Secondary Stakeholders**

- **QA Team**: Testing generated code quality
- **Product Owner**: Business value and priority
- **Future Developers**: Long-term maintainability

---

## 🎉 **Success Celebration**

Upon successful completion of this epic, we will have:

- **Eliminated 80% of manual boilerplate code creation**
- **Ensured 100% consistency across all generated code**
- **Reduced time-to-market for new features by 40%**
- **Created a reusable, extensible code generation system**
- **Established a foundation for future automation initiatives**

This epic represents a significant step toward a more automated, consistent, and productive development workflow that will benefit the team for years to come.
