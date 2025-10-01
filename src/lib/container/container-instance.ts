import type { Container } from "./types";
import { FlexibleContainer } from "./flexible-container";

// Global container instance
let globalContainer: Container | null = null;

export function getContainer(): Container {
  if (!globalContainer) {
    globalContainer = new FlexibleContainer();
  }
  return globalContainer;
}

export function setContainer(container: Container): void {
  globalContainer = container;
}
