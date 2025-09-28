import {
  CreateAlertRuleData,
  UpdateAlertRuleData,
  IncidentEvent,
} from "./IAlertRepository";
import { AlertRule } from "./ITargetRepository";
import { SpeedTestResult } from "./ITargetRepository";

export interface IAlertingService {
  // Alert rule management
  createAlertRule(data: CreateAlertRuleData): Promise<AlertRule>;
  getAlertRule(id: number): Promise<AlertRule | null>;
  getAlertRulesByTargetId(targetId: string): Promise<AlertRule[]>;
  updateAlertRule(id: number, data: UpdateAlertRuleData): Promise<AlertRule>;
  deleteAlertRule(id: number): Promise<void>;

  // Alert processing
  processSpeedTestResult(result: SpeedTestResult): Promise<void>;
  checkAlertRules(targetId: string, result: SpeedTestResult): Promise<void>;

  // Incident management
  getIncidentsByTargetId(targetId: string): Promise<IncidentEvent[]>;
  getUnresolvedIncidents(): Promise<IncidentEvent[]>;
  resolveIncident(id: number): Promise<void>;
  createIncident(data: {
    type: "OUTAGE" | "ALERT";
    description: string;
    targetId: string;
    ruleId?: number;
  }): Promise<IncidentEvent>;
}
