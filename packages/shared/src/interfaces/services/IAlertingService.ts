import type {
  CreateAlertRuleData,
  UpdateAlertRuleData,
} from "../repositories/IAlertRepository";
import type { StandardizedIncidentEvent } from "../../types/standardized-domain-types";
import type { AlertRule } from "../repositories/IAlertRuleRepository";
import type { StandardizedSpeedTestResult } from "../../types/standardized-domain-types";
import type { IService, IObservableService } from "../base/IService";

export interface IAlertingService
  extends IService<AlertRule, CreateAlertRuleData, UpdateAlertRuleData>,
    IObservableService {
  // Domain-specific alert rule methods
  createAlertRule(data: CreateAlertRuleData): Promise<AlertRule>;
  getAlertRule(id: string): Promise<AlertRule | null>;
  getAlertRulesByTargetId(targetId: string): Promise<AlertRule[]>;
  updateAlertRule(id: string, data: UpdateAlertRuleData): Promise<AlertRule>;
  deleteAlertRule(id: string): Promise<void>;

  // Alert processing
  processSpeedTestResult(result: StandardizedSpeedTestResult): Promise<void>;
  checkAlertRules(
    targetId: string,
    result: StandardizedSpeedTestResult
  ): Promise<void>;

  // Incident management
  getIncidentsByTargetId(
    targetId: string
  ): Promise<StandardizedIncidentEvent[]>;
  getUnresolvedIncidents(): Promise<StandardizedIncidentEvent[]>;
  resolveIncident(id: string): Promise<void>;
  createIncident(data: {
    type: "OUTAGE" | "ALERT";
    description: string;
    targetId: string;
    ruleId?: string;
  }): Promise<StandardizedIncidentEvent>;
}
