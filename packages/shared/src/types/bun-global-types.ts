// Bun runtime global types
// These types define the Bun-specific global objects and methods

export interface BunServeOptions {
  port?: number;
  hostname?: string;
  development?: boolean;
  fetch: (request: Request) => Response | Promise<Response>;
  error?: (error: Error) => Response | Promise<Response>;
}

export interface BunServer {
  port: number;
  hostname: string;
  development: boolean;
  stop(): void;
  reload(options: BunServeOptions): void;
}

export interface BunRuntime {
  serve(options: BunServeOptions): BunServer;
  version: string;
  revision: string;
  env: Record<string, string | undefined>;
}

// Type guard to check if we're running in Bun
export function isBunRuntime(): boolean {
  // Justification: Using unknown type for globalThis extensions, then type guarding
  return (
    "Bun" in globalThis &&
    typeof (globalThis as unknown as { Bun?: { serve?: unknown } }).Bun
      ?.serve === "function"
  );
}

// Safe accessor for Bun global
export function getBunGlobal(): BunRuntime | null {
  if (isBunRuntime()) {
    // Justification: Using unknown type for globalThis extensions, then casting to BunRuntime after type guard
    return (globalThis as unknown as { Bun: BunRuntime }).Bun;
  }
  return null;
}
