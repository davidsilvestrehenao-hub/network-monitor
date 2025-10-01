import type {
  Container,
  ServiceConfig,
  ServiceRegistry,
  ServiceFactory,
} from "./types";

export class FlexibleContainer implements Container {
  private services: ServiceRegistry = new Map();
  private instances: Map<symbol, unknown> = new Map();
  private initialized = false;

  register(key: symbol, config: ServiceConfig): void {
    this.services.set(key, config);
  }

  get<T>(key: symbol): T {
    if (!this.initialized) {
      throw new Error("Container not initialized. Call initialize() first.");
    }

    if (!this.services.has(key)) {
      throw new Error(`Service with key ${key.toString()} not found`);
    }

    // Return singleton instance if it exists
    if (this.instances.has(key)) {
      return this.instances.get(key) as T;
    }

    const config = this.services.get(key);
    if (!config) {
      throw new Error(
        `Service configuration not found for key ${key.toString()}`
      );
    }

    // Resolve dependencies (not used in current implementation)
    // const dependencies = config.dependencies.map(dep => this.get(dep));

    // Create instance
    const instance = config.factory(this);

    // Store singleton instance
    if (config.singleton) {
      this.instances.set(key, instance);
    }

    return instance as T;
  }

  has(key: symbol): boolean {
    return this.services.has(key);
  }

  getRegisteredTypes(): symbol[] {
    return Array.from(this.services.keys());
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Validate all dependencies exist
    for (const [key, config] of this.services) {
      for (const dep of config.dependencies) {
        if (!this.services.has(dep)) {
          throw new Error(
            `Service ${key.toString()} depends on ${dep.toString()} which is not registered`
          );
        }
      }
    }

    this.initialized = true;
  }
}
