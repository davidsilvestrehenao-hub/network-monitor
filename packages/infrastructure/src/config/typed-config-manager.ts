// Type-safe configuration manager implementation
// Provides runtime type safety and validation for all configuration

import type {
  ConfigSchema,
  TypedConfigManager,
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  ConfigDocumentation,
  ConfigLoader,
  ConfigLoadResult,
  ConfigSource,
  ConfigSourceInfo,
  TypedConfig,
} from "@network-monitor/shared";

export class TypedConfigManagerImpl implements TypedConfigManager {
  private schemas = new Map<string, ConfigSchema<unknown>>();
  private configs = new Map<string, TypedConfig<unknown>>();
  private watchers = new Map<string, Set<(config: unknown) => void>>();

  register<T>(name: string, schema: ConfigSchema<T>): void {
    this.schemas.set(name, schema as ConfigSchema<unknown>);
  }

  async get<T>(name: string): Promise<T> {
    const config = this.configs.get(name);
    if (config) {
      return config.get() as T;
    }

    // Load config for the first time
    const schema = this.schemas.get(name);
    if (!schema) {
      throw new Error(`No schema registered for config: ${name}`);
    }

    const loader = new DefaultConfigLoader(name, schema);
    const result = await loader.load();

    if (result.errors.length > 0) {
      throw new Error(
        `Configuration validation failed for ${name}: ${result.errors.map(e => e.message).join(", ")}`
      );
    }

    const typedConfig = new TypedConfigImpl(
      name,
      result.config,
      result.sources,
      schema
    );
    this.configs.set(name, typedConfig as TypedConfig<unknown>);

    return result.config as T;
  }

  getSync<T>(name: string): T | null {
    const config = this.configs.get(name);
    return config ? (config.get() as T) : null;
  }

  async reload<T>(name: string): Promise<T> {
    const config = this.configs.get(name);
    if (!config) {
      return this.get<T>(name);
    }

    const newValue = await config.reload();

    // Notify watchers
    const configWatchers = this.watchers.get(name);
    if (configWatchers) {
      configWatchers.forEach(callback => callback(newValue));
    }

    return newValue as T;
  }

  watch<T>(name: string, callback: (config: T) => void): () => void {
    if (!this.watchers.has(name)) {
      this.watchers.set(name, new Set());
    }

    const typedCallback = (config: unknown) => callback(config as T);
    this.watchers.get(name)!.add(typedCallback);

    // Return unwatch function
    return () => {
      const configWatchers = this.watchers.get(name);
      if (configWatchers) {
        configWatchers.delete(typedCallback);
        if (configWatchers.size === 0) {
          this.watchers.delete(name);
        }
      }
    };
  }

  validate<T>(name: string, config: unknown): ConfigValidationResult<T> {
    const schema = this.schemas.get(name);
    if (!schema) {
      return {
        success: false,
        errors: [
          {
            path: "",
            message: `No schema registered for config: ${name}`,
            code: "SCHEMA_NOT_FOUND",
          },
        ],
        warnings: [],
      };
    }

    try {
      if (schema.validate(config)) {
        return {
          success: true,
          data: config as T,
          errors: [],
          warnings: [],
        };
      } else {
        return {
          success: false,
          errors: [
            {
              path: "",
              message: "Configuration validation failed",
              code: "VALIDATION_FAILED",
              value: config,
            },
          ],
          warnings: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            path: "",
            message: error instanceof Error ? error.message : String(error),
            code: "VALIDATION_ERROR",
            value: config,
          },
        ],
        warnings: [],
      };
    }
  }

  getDocumentation(name: string): ConfigDocumentation | null {
    const schema = this.schemas.get(name);
    return schema ? schema.getDocumentation() : null;
  }
}

// Default configuration loader implementation
class DefaultConfigLoader<T> implements ConfigLoader<T> {
  constructor(
    private name: string,
    private schema: ConfigSchema<T>
  ) {}

  async load(
    sources: ConfigSource[] = ["environment", "file", "default"]
  ): Promise<ConfigLoadResult<T>> {
    const loadTime = new Date();
    const sourceInfos: ConfigSourceInfo[] = [];
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationWarning[] = [];

    let config: Partial<T> = {};

    // Load from each source in priority order
    for (const source of sources) {
      try {
        const sourceConfig = await this.loadFromSource(source);
        if (sourceConfig) {
          config = this.mergeConfigs(config, sourceConfig);
          sourceInfos.push({
            source,
            priority: sources.indexOf(source),
            lastModified: new Date(),
          });
        }
      } catch (error) {
        errors.push({
          path: source,
          message: error instanceof Error ? error.message : String(error),
          code: "SOURCE_LOAD_ERROR",
        });
      }
    }

    // Validate final config
    let finalConfig: T;
    try {
      if (this.schema.validate(config)) {
        finalConfig = config as T;
      } else {
        // Try to parse with schema (might provide defaults)
        finalConfig = this.schema.parse(config);
      }
    } catch (error) {
      // Fall back to default config
      finalConfig = this.schema.getDefault();
      warnings.push({
        path: "",
        message: "Using default configuration due to validation errors",
        code: "USING_DEFAULT",
      });
    }

    return {
      config: finalConfig,
      sources: sourceInfos,
      loadTime,
      errors,
      warnings,
    };
  }

  async reload(): Promise<ConfigLoadResult<T>> {
    return this.load();
  }

  watch(callback: (config: T) => void): () => void {
    // Simple implementation - in a real system, this would watch file system, etc.
    const interval = setInterval(async () => {
      try {
        const result = await this.reload();
        callback(result.config);
      } catch (error) {
        // Justification: Error logging in config system infrastructure
        // eslint-disable-next-line no-console
        console.error(`Error reloading config ${this.name}:`, error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }

  validate(config: unknown): ConfigValidationResult<T> {
    try {
      if (this.schema.validate(config)) {
        return {
          success: true,
          data: config as T,
          errors: [],
          warnings: [],
        };
      } else {
        return {
          success: false,
          errors: [
            {
              path: "",
              message: "Configuration validation failed",
              code: "VALIDATION_FAILED",
              value: config,
            },
          ],
          warnings: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            path: "",
            message: error instanceof Error ? error.message : String(error),
            code: "VALIDATION_ERROR",
            value: config,
          },
        ],
        warnings: [],
      };
    }
  }

  private async loadFromSource(
    source: ConfigSource
  ): Promise<Partial<T> | null> {
    switch (source) {
      case "environment":
        return this.loadFromEnvironment();
      case "file":
        return this.loadFromFile();
      case "default":
        return this.schema.getDefault();
      default:
        return null;
    }
  }

  private loadFromEnvironment(): Partial<T> | null {
    const envConfig: Record<string, unknown> = {};
    const prefix = `${this.name.toUpperCase()}_`;

    // Load environment variables with the config name prefix
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(prefix)) {
        const configKey = key.slice(prefix.length).toLowerCase();
        envConfig[configKey] = this.parseEnvValue(value);
      }
    }

    return Object.keys(envConfig).length > 0 ? (envConfig as Partial<T>) : null;
  }

  private async loadFromFile(): Promise<Partial<T> | null> {
    // In a real implementation, you would iterate through config paths like:
    // - `config/${this.name}.json`
    // - `config/${this.name}.${process.env.NODE_ENV || "development"}.json`
    // - `.${this.name}rc.json`
    // and use fs.readFile to load configuration files
    // For now, return null to indicate file not found
    return null;
  }

  private parseEnvValue(value: string | undefined): unknown {
    if (!value) return undefined;

    // Try to parse as JSON first
    try {
      return JSON.parse(value);
    } catch {
      // Return as string if not valid JSON
      return value;
    }
  }

  private mergeConfigs(target: Partial<T>, source: Partial<T>): Partial<T> {
    const result = { ...target };

    for (const [key, value] of Object.entries(source)) {
      if (value !== undefined) {
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Deep merge objects
          result[key as keyof T] = this.mergeConfigs(
            (result[key as keyof T] as Partial<T>) || {},
            value as Partial<T>
          ) as T[keyof T];
        } else {
          // Override primitive values and arrays
          result[key as keyof T] = value as T[keyof T];
        }
      }
    }

    return result;
  }
}

// Typed configuration implementation
class TypedConfigImpl<T> implements TypedConfig<T> {
  private watchers = new Set<(newValue: T, oldValue: T) => void>();

  constructor(
    public readonly name: string,
    public value: T,
    public readonly sources: ConfigSourceInfo[],
    private schema: ConfigSchema<T>,
    public readonly lastLoaded: Date = new Date()
  ) {}

  get(): T {
    return this.value;
  }

  async reload(): Promise<T> {
    const loader = new DefaultConfigLoader(this.name, this.schema);
    const result = await loader.load();

    if (result.errors.length > 0) {
      throw new Error(
        `Configuration reload failed for ${this.name}: ${result.errors.map(e => e.message).join(", ")}`
      );
    }

    const oldValue = this.value;
    this.value = result.config;

    // Notify watchers
    this.watchers.forEach(callback => callback(this.value, oldValue));

    return this.value;
  }

  validate(newValue: unknown): ConfigValidationResult<T> {
    try {
      if (this.schema.validate(newValue)) {
        return {
          success: true,
          data: newValue as T,
          errors: [],
          warnings: [],
        };
      } else {
        return {
          success: false,
          errors: [
            {
              path: "",
              message: "Configuration validation failed",
              code: "VALIDATION_FAILED",
              value: newValue,
            },
          ],
          warnings: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            path: "",
            message: error instanceof Error ? error.message : String(error),
            code: "VALIDATION_ERROR",
            value: newValue,
          },
        ],
        warnings: [],
      };
    }
  }

  async update(newValue: Partial<T>): Promise<T> {
    const merged = { ...this.value, ...newValue };
    const validation = this.validate(merged);

    if (!validation.success) {
      throw new Error(
        `Configuration update failed: ${validation.errors.map(e => e.message).join(", ")}`
      );
    }

    const oldValue = this.value;
    this.value = validation.data!;

    // Notify watchers
    this.watchers.forEach(callback => callback(this.value, oldValue));

    return this.value;
  }

  watch(callback: (newValue: T, oldValue: T) => void): () => void {
    this.watchers.add(callback);

    return () => {
      this.watchers.delete(callback);
    };
  }

  getPath<K extends keyof T>(path: K): T[K];
  getPath<K extends keyof T, L extends keyof T[K]>(
    path: K,
    subPath: L
  ): T[K][L];
  getPath<K extends keyof T, L extends keyof T[K]>(
    path: K,
    subPath?: L
  ): T[K] | T[K][L] {
    const value = this.value[path];
    return subPath !== undefined ? (value as T[K])[subPath] : value;
  }

  async updatePath<K extends keyof T>(path: K, value: T[K]): Promise<T>;
  async updatePath<K extends keyof T, L extends keyof T[K]>(
    path: K,
    subPath: L,
    value: T[K][L]
  ): Promise<T>;
  async updatePath<K extends keyof T, L extends keyof T[K]>(
    path: K,
    subPathOrValue: L | T[K],
    value?: T[K][L]
  ): Promise<T> {
    if (value !== undefined) {
      // Update nested path
      const subPath = subPathOrValue as L;
      const currentValue = this.value[path] as T[K];
      const updatedValue = { ...currentValue, [subPath]: value };
      return this.update({ [path]: updatedValue } as Partial<T>);
    } else {
      // Update top-level path
      const newValue = subPathOrValue as T[K];
      return this.update({ [path]: newValue } as unknown as Partial<T>);
    }
  }
}

// Configuration schema builder implementation
export class ConfigSchemaBuilder<T> {
  private validators: Array<(value: T) => boolean> = [];
  private transformers: Array<(value: unknown) => unknown> = [];
  private defaultValue?: T;
  private isOptional = false;

  static create<T>(): ConfigSchemaBuilder<T> {
    return new ConfigSchemaBuilder<T>();
  }

  string(options?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }): ConfigSchemaBuilder<T> {
    this.validators.push((value: T) => {
      if (typeof value !== "string") return false;
      if (options?.minLength && value.length < options.minLength) return false;
      if (options?.maxLength && value.length > options.maxLength) return false;
      if (options?.pattern && !options.pattern.test(value)) return false;
      return true;
    });
    return this;
  }

  number(options?: {
    min?: number;
    max?: number;
    integer?: boolean;
  }): ConfigSchemaBuilder<T> {
    this.validators.push((value: T) => {
      if (typeof value !== "number") return false;
      if (options?.min !== undefined && value < options.min) return false;
      if (options?.max !== undefined && value > options.max) return false;
      if (options?.integer && !Number.isInteger(value)) return false;
      return true;
    });
    return this;
  }

  boolean(): ConfigSchemaBuilder<T> {
    this.validators.push((value: T) => typeof value === "boolean");
    return this;
  }

  optional(): ConfigSchemaBuilder<T | undefined> {
    this.isOptional = true;
    return this as ConfigSchemaBuilder<T | undefined>;
  }

  default(value: T): ConfigSchemaBuilder<T> {
    this.defaultValue = value;
    return this;
  }

  validate(
    validator: (value: T) => boolean,
    _message?: string
  ): ConfigSchemaBuilder<T> {
    this.validators.push(validator);
    return this;
  }

  transform<U>(transformer: (value: T) => U): ConfigSchemaBuilder<U> {
    this.transformers.push(transformer as (value: unknown) => unknown);
    return this as unknown as ConfigSchemaBuilder<U>;
  }

  build(): ConfigSchema<T> {
    return new ConfigSchemaImpl<T>(
      this.validators,
      this.transformers,
      this.defaultValue,
      this.isOptional
    );
  }
}

// Configuration schema implementation
class ConfigSchemaImpl<T> implements ConfigSchema<T> {
  constructor(
    private validators: Array<(value: T) => boolean>,
    private transformers: Array<(value: unknown) => unknown>,
    private defaultValue?: T,
    private isOptional = false
  ) {}

  validate(config: unknown): config is T {
    if (config === undefined || config === null) {
      return this.isOptional || this.defaultValue !== undefined;
    }

    // Apply transformations
    let value = config;
    for (const transformer of this.transformers) {
      value = transformer(value) as Record<string, unknown>;
    }

    // Apply validations
    for (const validator of this.validators) {
      if (!validator(value as T)) {
        return false;
      }
    }

    return true;
  }

  parse(config: unknown): T {
    if (config === undefined || config === null) {
      if (this.defaultValue !== undefined) {
        return this.defaultValue;
      }
      if (this.isOptional) {
        return undefined as T;
      }
      throw new Error("Required configuration value is missing");
    }

    // Apply transformations
    let value = config;
    for (const transformer of this.transformers) {
      value = transformer(value) as Record<string, unknown>;
    }

    // Validate
    if (!this.validate(value)) {
      throw new Error("Configuration validation failed");
    }

    return value as T;
  }

  getDefault(): T {
    if (this.defaultValue !== undefined) {
      return this.defaultValue;
    }
    if (this.isOptional) {
      return undefined as T;
    }
    throw new Error("No default value available");
  }

  getExample(): T {
    return this.getDefault();
  }

  getDocumentation(): ConfigDocumentation {
    return {
      title: "Configuration Schema",
      description: "Auto-generated configuration schema",
      fields: {},
      examples: [
        {
          name: "default",
          description: "Default configuration",
          config: this.getDefault(),
        },
      ],
    };
  }
}
