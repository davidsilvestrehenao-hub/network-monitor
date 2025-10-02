// Type-safe configuration system with schema validation
// Provides compile-time and runtime type safety for all configuration

// Base configuration schema interface
export interface ConfigSchema<T> {
  validate(config: unknown): config is T;
  parse(config: unknown): T;
  getDefault(): T;
  getExample(): T;
  getDocumentation(): ConfigDocumentation;
}

// Configuration documentation
export interface ConfigDocumentation {
  title: string;
  description: string;
  fields: Record<string, FieldDocumentation>;
  examples: Array<{ name: string; description: string; config: unknown }>;
}

export interface FieldDocumentation {
  type: string;
  description: string;
  required: boolean;
  default?: unknown;
  examples?: unknown[];
  validation?: string[];
  deprecated?: boolean;
  deprecationMessage?: string;
}

// Configuration validation result
export interface ConfigValidationResult<T> {
  success: boolean;
  data?: T;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

export interface ConfigValidationError {
  path: string;
  message: string;
  code: string;
  value?: unknown;
  expectedType?: string;
}

export interface ConfigValidationWarning {
  path: string;
  message: string;
  code: string;
  value?: unknown;
}

// Environment-specific configuration
export interface EnvironmentConfig<T> {
  development: T;
  test: T;
  staging: T;
  production: T;
}

// Configuration source types
export type ConfigSource =
  | "environment"
  | "file"
  | "database"
  | "remote"
  | "default";

export interface ConfigSourceInfo {
  source: ConfigSource;
  path?: string;
  priority: number;
  lastModified?: Date;
  checksum?: string;
}

// Configuration loader interface
export interface ConfigLoader<T> {
  load(sources?: ConfigSource[]): Promise<ConfigLoadResult<T>>;
  reload(): Promise<ConfigLoadResult<T>>;
  watch(callback: (config: T) => void): () => void; // Returns unwatch function
  validate(config: unknown): ConfigValidationResult<T>;
}

export interface ConfigLoadResult<T> {
  config: T;
  sources: ConfigSourceInfo[];
  loadTime: Date;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

// Typed configuration manager
export interface TypedConfigManager {
  register<T>(name: string, schema: ConfigSchema<T>): void;
  get<T>(name: string): Promise<T>;
  getSync<T>(name: string): T | null;
  reload<T>(name: string): Promise<T>;
  watch<T>(name: string, callback: (config: T) => void): () => void;
  validate<T>(name: string, config: unknown): ConfigValidationResult<T>;
  getDocumentation(name: string): ConfigDocumentation | null;
}

// Application-specific configuration schemas
export interface DatabaseConfig {
  url: string;
  provider: "sqlite" | "postgresql" | "mysql";
  ssl: boolean;
  poolSize: number;
  timeout: number;
  retries: number;
  logging: boolean;
  migrations: {
    enabled: boolean;
    directory: string;
    autoRun: boolean;
  };
}

export interface ServerConfig {
  host: string;
  port: number;
  cors: {
    enabled: boolean;
    origins: string[];
    credentials: boolean;
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
  compression: {
    enabled: boolean;
    level: number;
  };
  security: {
    helmet: boolean;
    hsts: boolean;
    contentSecurityPolicy: boolean;
  };
}

export interface LoggingConfig {
  level: "debug" | "info" | "warn" | "error" | "fatal";
  format: "json" | "text" | "pretty";
  outputs: Array<{
    type: "console" | "file" | "database" | "remote";
    config: Record<string, unknown>;
  }>;
  sampling: {
    enabled: boolean;
    rate: number;
  };
  structured: boolean;
  includeStackTrace: boolean;
}

export interface CacheConfig {
  enabled: boolean;
  provider: "memory" | "redis" | "memcached";
  ttl: number;
  maxSize: number;
  keyPrefix: string;
  compression: boolean;
  serialization: "json" | "msgpack" | "protobuf";
  connection?: {
    host: string;
    port: number;
    password?: string;
    database?: number;
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: {
    enabled: boolean;
    port: number;
    path: string;
    interval: number;
  };
  tracing: {
    enabled: boolean;
    serviceName: string;
    endpoint?: string;
    sampleRate: number;
  };
  healthCheck: {
    enabled: boolean;
    path: string;
    timeout: number;
    checks: string[];
  };
}

export interface SecurityConfig {
  authentication: {
    enabled: boolean;
    providers: Array<{
      name: string;
      type: "oauth" | "jwt" | "basic" | "api-key";
      config: Record<string, unknown>;
    }>;
    session: {
      secret: string;
      maxAge: number;
      secure: boolean;
      httpOnly: boolean;
    };
  };
  authorization: {
    enabled: boolean;
    defaultRole: string;
    roles: Record<string, string[]>;
  };
  encryption: {
    algorithm: string;
    keySize: number;
    ivSize: number;
  };
}

export interface FeatureFlags {
  [key: string]:
    | boolean
    | string
    | number
    | {
        enabled: boolean;
        rollout?: number;
        conditions?: Record<string, unknown>;
      };
}

export interface ApplicationConfig {
  name: string;
  version: string;
  environment: "development" | "test" | "staging" | "production";
  debug: boolean;
  database: DatabaseConfig;
  server: ServerConfig;
  logging: LoggingConfig;
  cache: CacheConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  features: FeatureFlags;
  external: {
    services: Record<
      string,
      {
        baseUrl: string;
        timeout: number;
        retries: number;
        apiKey?: string;
      }
    >;
  };
}

// Configuration schema builders
export interface SchemaBuilder<T> {
  string(options?: StringOptions): SchemaBuilder<T>;
  number(options?: NumberOptions): SchemaBuilder<T>;
  boolean(options?: BooleanOptions): SchemaBuilder<T>;
  array<U>(
    itemSchema: ConfigSchema<U>,
    options?: ArrayOptions
  ): SchemaBuilder<T>;
  object<U>(
    schema: Record<keyof U, ConfigSchema<unknown>>,
    options?: ObjectOptions
  ): SchemaBuilder<T>;
  enum<U extends string>(values: U[], options?: EnumOptions): SchemaBuilder<T>;
  optional(): SchemaBuilder<T | undefined>;
  default(value: T): SchemaBuilder<T>;
  validate(
    validator: (value: T) => boolean,
    message?: string
  ): SchemaBuilder<T>;
  transform<U>(transformer: (value: T) => U): SchemaBuilder<U>;
  build(): ConfigSchema<T>;
}

export interface StringOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  format?: "email" | "url" | "uuid" | "date" | "time" | "datetime";
}

export interface NumberOptions {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
}

export interface BooleanOptions {
  // No specific options for boolean
}

export interface ArrayOptions {
  minItems?: number;
  maxItems?: number;
  unique?: boolean;
}

export interface ObjectOptions {
  additionalProperties?: boolean;
  strict?: boolean;
}

export interface EnumOptions {
  caseSensitive?: boolean;
}

// Configuration providers
export interface EnvironmentConfigProvider {
  get(key: string): string | undefined;
  getAll(): Record<string, string>;
  has(key: string): boolean;
}

export interface FileConfigProvider {
  load(path: string): Promise<unknown>;
  watch(path: string, callback: (config: unknown) => void): () => void;
  exists(path: string): Promise<boolean>;
}

export interface DatabaseConfigProvider {
  load(query: string, params?: unknown[]): Promise<unknown>;
  save(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  watch(key: string, callback: (value: unknown) => void): () => void;
}

export interface RemoteConfigProvider {
  load(url: string, options?: RequestInit): Promise<unknown>;
  poll(
    url: string,
    interval: number,
    callback: (config: unknown) => void
  ): () => void;
}

// Configuration merger for combining multiple sources
export interface ConfigMerger {
  merge<T>(...configs: Partial<T>[]): T;
  mergeWithPriority<T>(
    configs: Array<{ config: Partial<T>; priority: number }>
  ): T;
  deepMerge<T>(target: T, source: Partial<T>): T;
}

// Configuration encryption for sensitive values
export interface ConfigEncryption {
  encrypt(value: string): string;
  decrypt(encryptedValue: string): string;
  isEncrypted(value: string): boolean;
  encryptObject<T extends Record<string, unknown>>(
    obj: T,
    sensitiveFields: string[]
  ): T;
  decryptObject<T extends Record<string, unknown>>(
    obj: T,
    sensitiveFields: string[]
  ): T;
}

// Configuration hot-reload support
export interface ConfigHotReload {
  enable<T>(
    configName: string,
    callback: (newConfig: T, oldConfig: T) => void
  ): void;
  disable(configName: string): void;
  isEnabled(configName: string): boolean;
  getWatchedConfigs(): string[];
}

// Configuration backup and restore
export interface ConfigBackup {
  backup<T>(configName: string, config: T): Promise<string>; // Returns backup ID
  restore<T>(configName: string, backupId: string): Promise<T>;
  listBackups(
    configName: string
  ): Promise<Array<{ id: string; timestamp: Date; size: number }>>;
  deleteBackup(configName: string, backupId: string): Promise<void>;
}

// Configuration audit trail
export interface ConfigAudit {
  log<T>(
    configName: string,
    oldConfig: T,
    newConfig: T,
    userId?: string
  ): Promise<void>;
  getHistory(configName: string, limit?: number): Promise<ConfigAuditEntry[]>;
  getChanges(
    configName: string,
    fromDate: Date,
    toDate: Date
  ): Promise<ConfigAuditEntry[]>;
}

export interface ConfigAuditEntry {
  id: string;
  configName: string;
  timestamp: Date;
  userId?: string;
  changes: Array<{
    path: string;
    oldValue: unknown;
    newValue: unknown;
    operation: "add" | "update" | "delete";
  }>;
  metadata?: Record<string, unknown>;
}

// Configuration factory for creating typed configurations
export interface ConfigFactory {
  create<T>(
    name: string,
    schema: ConfigSchema<T>,
    sources?: ConfigSource[]
  ): Promise<TypedConfig<T>>;
  createFromEnvironment<T>(
    name: string,
    schema: ConfigSchema<T>,
    prefix?: string
  ): Promise<TypedConfig<T>>;
  createFromFile<T>(
    name: string,
    schema: ConfigSchema<T>,
    path: string
  ): Promise<TypedConfig<T>>;
  createFromDatabase<T>(
    name: string,
    schema: ConfigSchema<T>,
    query: string
  ): Promise<TypedConfig<T>>;
}

// Typed configuration wrapper
export interface TypedConfig<T> {
  readonly name: string;
  readonly value: T;
  readonly sources: ConfigSourceInfo[];
  readonly lastLoaded: Date;

  get(): T;
  reload(): Promise<T>;
  validate(newValue: unknown): ConfigValidationResult<T>;
  update(newValue: Partial<T>): Promise<T>;
  watch(callback: (newValue: T, oldValue: T) => void): () => void;

  // Nested access
  getPath<K extends keyof T>(path: K): T[K];
  getPath<K extends keyof T, L extends keyof T[K]>(
    path: K,
    subPath: L
  ): T[K][L];

  // Type-safe updates
  updatePath<K extends keyof T>(path: K, value: T[K]): Promise<T>;
  updatePath<K extends keyof T, L extends keyof T[K]>(
    path: K,
    subPath: L,
    value: T[K][L]
  ): Promise<T>;
}

// Configuration context for dependency injection
export interface ConfigContext {
  get<T>(name: string): TypedConfig<T>;
  getAll(): Record<string, TypedConfig<unknown>>;
  register<T>(name: string, config: TypedConfig<T>): void;
  unregister(name: string): void;
}
