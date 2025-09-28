import { createSignal } from "solid-js";
import { AlertRule, Target } from "~/lib/services/interfaces/ITargetRepository";

interface AlertRuleCardProps {
  rule: AlertRule;
  target?: Target;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}

export function AlertRuleCard(props: AlertRuleCardProps) {
  const [isToggling, setIsToggling] = createSignal(false);

  const getMetricIcon = (metric: string): string => {
    switch (metric) {
      case "ping":
        return "🏓";
      case "download":
        return "⬇️";
      default:
        return "📊";
    }
  };

  const getConditionText = (
    condition: string,
    threshold: number,
    metric: string
  ): string => {
    const unit = metric === "ping" ? "ms" : "Mbps";
    switch (condition) {
      case "GREATER_THAN":
        return `> ${threshold}${unit}`;
      case "LESS_THAN":
        return `< ${threshold}${unit}`;
      default:
        return `${condition} ${threshold}${unit}`;
    }
  };

  const getStatusColor = (enabled: boolean): string => {
    return enabled
      ? "text-green-600 bg-green-100"
      : "text-gray-600 bg-gray-100";
  };

  const getStatusText = (enabled: boolean): string => {
    return enabled ? "Active" : "Disabled";
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await props.onToggle(!props.rule.enabled);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-2">
            <span class="text-2xl">{getMetricIcon(props.rule.metric)}</span>
            <h3 class="text-lg font-semibold text-gray-900">
              {props.rule.name}
            </h3>
          </div>
          <p class="text-sm text-gray-600">
            {props.target?.name || `Target ${props.rule.targetId.slice(-4)}`}
          </p>
        </div>
        <div class="flex space-x-1 ml-2">
          <button
            onClick={() => props.onEdit()}
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit rule"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => props.onDelete()}
            class="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete rule"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Rule Details */}
      <div class="space-y-3 mb-4">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Metric:</span>
          <span class="text-sm font-medium text-gray-900 capitalize">
            {props.rule.metric}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Condition:</span>
          <span class="text-sm font-medium text-gray-900">
            {getConditionText(
              props.rule.condition,
              props.rule.threshold,
              props.rule.metric
            )}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Status:</span>
          <span
            class={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(props.rule.enabled)}`}
          >
            {getStatusText(props.rule.enabled)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div class="flex space-x-2">
        <button
          onClick={handleToggle}
          disabled={isToggling()}
          class={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
            props.rule.enabled
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {isToggling() ? "..." : props.rule.enabled ? "Disable" : "Enable"}
        </button>
        <button
          onClick={() => props.onEdit()}
          class="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
