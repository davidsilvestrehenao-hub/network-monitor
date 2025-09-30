import { getAppContext } from "~/lib/container/container";
import type {
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
} from "~/lib/services/interfaces/ITargetRepository";
import type { SpeedTestConfig } from "~/lib/services/interfaces/IMonitorService";

// Target management endpoints
export async function createTarget(data: CreateTargetData) {
  const ctx = await getAppContext();
  if (!ctx.services.monitor) {
    throw new Error("Monitor service not available");
  }
  return await ctx.services.monitor.createTarget(data);
}

export async function getTarget(id: string) {
  const ctx = await getAppContext();
  if (!ctx.services.monitor) {
    throw new Error("Monitor service not available");
  }
  return await ctx.services.monitor.getTarget(id);
}

export async function getTargets(userId: string) {
  const ctx = await getAppContext();
  if (!ctx.services.monitor) {
    throw new Error("Monitor service not available");
  }
  return await ctx.services.monitor.getTargets(userId);
}

export async function updateTarget(id: string, data: UpdateTargetData) {
  const ctx = await getAppContext();
  if (!ctx.services.monitor) {
    throw new Error("Monitor service not available");
  }
  return await ctx.services.monitor.updateTarget(id, data);
}

export async function deleteTarget(id: string) {
  const ctx = await getAppContext();
  if (!ctx.services.monitor) {
    throw new Error("Monitor service not available");
  }
  await ctx.services.monitor.deleteTarget(id);
}

// Monitoring endpoints
export async function runSpeedTest(
  config: SpeedTestConfig
): Promise<SpeedTestResult> {
  const ctx = await getAppContext();
  if (!ctx.services.monitor) {
    throw new Error("Monitor service not available");
  }
  return await ctx.services.monitor.runSpeedTest(config);
}

export async function startMonitoring(targetId: string, intervalMs: number) {
  const ctx = await getAppContext();
  if (!ctx.services.monitor) {
    throw new Error("Monitor service not available");
  }
  ctx.services.monitor.startMonitoring(targetId, intervalMs);
  return { success: true };
}

export async function stopMonitoring(targetId: string) {
  const ctx = await getAppContext();
  if (!ctx.services.monitor) {
    throw new Error("Monitor service not available");
  }
  ctx.services.monitor.stopMonitoring(targetId);
  return { success: true };
}

export async function getActiveTargets() {
  const ctx = await getAppContext();
  if (!ctx.services.monitor) {
    throw new Error("Monitor service not available");
  }
  return ctx.services.monitor.getActiveTargets();
}

export async function getTargetResults(targetId: string, limit?: number) {
  const ctx = await getAppContext();
  if (!ctx.services.monitor) {
    throw new Error("Monitor service not available");
  }
  return await ctx.services.monitor.getTargetResults(targetId, limit);
}
