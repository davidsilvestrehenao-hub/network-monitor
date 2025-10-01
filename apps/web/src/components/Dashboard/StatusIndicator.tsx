import { type Component } from "solid-js";

export type TargetStatus = "healthy" | "warning" | "critical" | "unknown";

interface StatusIndicatorProps {
  status: TargetStatus;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  TargetStatus,
  { color: string; bgColor: string; label: string }
> = {
  healthy: {
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    label: "Healthy",
  },
  warning: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    label: "Warning",
  },
  critical: {
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    label: "Critical",
  },
  unknown: {
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-700",
    label: "Unknown",
  },
};

const sizeConfig = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export const StatusIndicator: Component<StatusIndicatorProps> = props => {
  const status = () => statusConfig[props.status];
  const size = () => sizeConfig[props.size || "md"];

  return (
    <div class="flex items-center space-x-2">
      <div
        class={`rounded-full ${size()} ${status().bgColor} ${status().color}`}
      >
        <div class={`rounded-full ${size()} ${status().color} animate-pulse`} />
      </div>
      {props.label && (
        <span class={`text-sm font-medium ${status().color}`}>
          {props.label || status().label}
        </span>
      )}
    </div>
  );
};
