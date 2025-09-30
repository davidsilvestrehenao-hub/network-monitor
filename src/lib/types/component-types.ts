// Component-specific type definitions

export interface NotificationSettings {
  enableNotifications: boolean;
  enablePushNotifications: boolean;
}

export interface MonitoringSettings {
  monitoringInterval: number;
  dataRetentionDays: number;
  autoCleanup: boolean;
}

export interface AlertRuleFormData {
  name: string;
  targetId: string;
  metric: "ping" | "download";
  condition: "GREATER_THAN" | "LESS_THAN";
  threshold: number;
  enabled: boolean;
}

export interface TestNotificationFormData {
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  userId: string;
}

export interface ThemeValue {
  value: string;
  label: string;
}

// Common component prop types
import type { JSX } from "solid-js";

export interface ComponentChildren {
  children: JSX.Element | JSX.Element[];
}

// Form submission handlers
export type SettingsChangeHandler<T> = (settings: T) => void;
export type FormSubmitHandler<T> = (data: T) => void;
export type AlertRuleSubmitHandler = (
  id: number,
  data: Partial<AlertRuleFormData>
) => void;
