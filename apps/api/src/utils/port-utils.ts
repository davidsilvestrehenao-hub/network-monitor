import { createServer } from "net";

/**
 * Find an available port starting from the given port
 * @param startPort - The port to start checking from
 * @returns Promise<number> - The first available port found
 */
export async function findAvailablePort(startPort: number): Promise<number> {
  let currentPort = startPort;
  const maxAttempts = 100; // Prevent infinite loops
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const isAvailable = await isPortAvailable(currentPort);
      if (isAvailable) {
        return currentPort;
      }
      currentPort++;
      attempts++;
    } catch (error) {
      currentPort++;
      attempts++;
    }
  }

  throw new Error(
    `No available port found after checking ${maxAttempts} ports starting from ${startPort}`
  );
}

/**
 * Check if a port is available
 * @param port - The port to check
 * @returns Promise<boolean> - True if port is available
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = createServer();

    server.listen(port, () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.on("error", () => {
      resolve(false);
    });
  });
}
