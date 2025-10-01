import { getAppContext } from "~/lib/container/container";
import type {
  CreateAlertRuleData,
  UpdateAlertRuleData,
} from "@network-monitor/shared";
import type { AlertRule } from "@network-monitor/shared";
import type { IncidentEvent } from "@network-monitor/shared";

// Alert rule management endpoints
export async function createAlertRule(
  data: CreateAlertRuleData
): Promise<AlertRule> {
  const ctx = await getAppContext();
  if (!ctx.services.alerting) {
    throw new Error("Alerting service not available");
  }
  return await ctx.services.alerting.createAlertRule(data);
}

export async function getAlertRule(id: number): Promise<AlertRule | null> {
  const ctx = await getAppContext();
  if (!ctx.services.alerting) {
    throw new Error("Alerting service not available");
  }
  return await ctx.services.alerting.getAlertRule(id);
}

export async function getAlertRulesByTargetId(
  targetId: string
): Promise<AlertRule[]> {
  const ctx = await getAppContext();
  if (!ctx.services.alerting) {
    throw new Error("Alerting service not available");
  }
  return await ctx.services.alerting.getAlertRulesByTargetId(targetId);
}

export async function updateAlertRule(
  id: number,
  data: UpdateAlertRuleData
): Promise<AlertRule> {
  const ctx = await getAppContext();
  if (!ctx.services.alerting) {
    throw new Error("Alerting service not available");
  }
  return await ctx.services.alerting.updateAlertRule(id, data);
}

export async function deleteAlertRule(id: number): Promise<void> {
  const ctx = await getAppContext();
  if (!ctx.services.alerting) {
    throw new Error("Alerting service not available");
  }
  await ctx.services.alerting.deleteAlertRule(id);
}

export async function toggleAlertRule(
  id: number,
  enabled: boolean
): Promise<AlertRule> {
  const ctx = await getAppContext();
  if (!ctx.services.alerting) {
    throw new Error("Alerting service not available");
  }
  // Toggle by updating the enabled property
  return await ctx.services.alerting.updateAlertRule(id, { enabled });
}

// Incident management endpoints
export async function getIncidentsByTargetId(
  targetId: string
): Promise<IncidentEvent[]> {
  const ctx = await getAppContext();
  if (!ctx.services.alerting) {
    throw new Error("Alerting service not available");
  }
  return await ctx.services.alerting.getIncidentsByTargetId(targetId);
}

export async function resolveIncident(id: number): Promise<void> {
  const ctx = await getAppContext();
  if (!ctx.services.alerting) {
    throw new Error("Alerting service not available");
  }
  await ctx.services.alerting.resolveIncident(id);
}
