// Import from canonical sources to avoid duplication
import type { SpeedTestResult } from './ISpeedTestResultRepository';
import type { AlertRule } from './IAlertRuleRepository';

// Re-export for convenience
export type { SpeedTestResult, AlertRule };

// Domain types
export interface Target {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  speedTestResults: SpeedTestResult[];
  alertRules: AlertRule[];
}

export interface CreateTargetData {
  name: string;
  address: string;
  ownerId: string;
}

export interface UpdateTargetData {
  name?: string;
  address?: string;
}

export interface ITargetRepository {
  findById(id: string): Promise<Target | null>;
  findByUserId(userId: string): Promise<Target[]>;
  create(data: CreateTargetData): Promise<Target>;
  update(id: string, data: UpdateTargetData): Promise<Target>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  getAll(limit?: number, offset?: number): Promise<Target[]>;
}
