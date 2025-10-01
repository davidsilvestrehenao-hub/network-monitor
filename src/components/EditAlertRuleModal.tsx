import { createSignal, createEffect, For } from "solid-js";
import type {
  AlertRule,
  Target,
} from "@network-monitor/shared";
import type { AlertRuleSubmitHandler } from "~/lib/types/component-types";

interface EditAlertRuleModalProps {
  rule: AlertRule;
  targets: Target[];
  onClose: () => void;
  onSubmit: AlertRuleSubmitHandler;
}

export function EditAlertRuleModal(props: EditAlertRuleModalProps) {
  const [name, setName] = createSignal("");
  const [targetId, setTargetId] = createSignal("");
  const [metric, setMetric] = createSignal<"ping" | "download">("ping");
  const [condition, setCondition] = createSignal<"GREATER_THAN" | "LESS_THAN">(
    "GREATER_THAN"
  );
  const [threshold, setThreshold] = createSignal("");
  const [enabled, setEnabled] = createSignal(true);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Initialize form with rule data
  createEffect(() => {
    setName(props.rule.name);
    setTargetId(props.rule.targetId);
    setMetric(props.rule.metric);
    setCondition(props.rule.condition);
    setThreshold(props.rule.threshold.toString());
    setEnabled(props.rule.enabled);
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!name().trim()) {
      setError("Rule name is required");
      return;
    }

    if (!targetId()) {
      setError("Please select a target");
      return;
    }

    const thresholdValue = parseFloat(threshold());
    if (isNaN(thresholdValue) || thresholdValue <= 0) {
      setError("Please enter a valid threshold value");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await props.onSubmit(props.rule.id, {
        name: name().trim(),
        targetId: targetId(),
        metric: metric(),
        condition: condition(),
        threshold: thresholdValue,
        enabled: enabled(),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update alert rule"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading()) {
      setError(null);
      props.onClose();
    }
  };

  const getMetricDescription = (metric: string): string => {
    switch (metric) {
      case "ping":
        return "Response time in milliseconds";
      case "download":
        return "Download speed in Mbps";
      default:
        return "";
    }
  };

  const getConditionDescription = (condition: string): string => {
    switch (condition) {
      case "GREATER_THAN":
        return "Alert when value is greater than threshold";
      case "LESS_THAN":
        return "Alert when value is less than threshold";
      default:
        return "";
    }
  };

  return (
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">
                Edit Alert Rule
              </h3>
              <button
                onClick={handleClose}
                disabled={loading()}
                class="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} class="px-6 py-4">
            <div class="space-y-4">
              <div>
                <label
                  for="edit-rule-name"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rule Name *
                </label>
                <input
                  id="edit-rule-name"
                  type="text"
                  value={name()}
                  onInput={e => setName(e.currentTarget.value)}
                  placeholder="e.g., High Ping Alert"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading()}
                  required
                />
              </div>

              <div>
                <label
                  for="edit-target-select"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Target *
                </label>
                <select
                  id="edit-target-select"
                  value={targetId()}
                  onChange={e => setTargetId(e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading()}
                  required
                >
                  <option value="">Select a target</option>
                  <For each={props.targets}>
                    {(target: Target) => (
                      <option value={target.id}>{target.name}</option>
                    )}
                  </For>
                </select>
              </div>

              <div>
                <label
                  for="edit-metric-select"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Metric *
                </label>
                <select
                  id="edit-metric-select"
                  value={metric()}
                  onChange={e =>
                    setMetric(e.currentTarget.value as "ping" | "download")
                  }
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading()}
                  required
                >
                  <option value="ping">Ping (Response Time)</option>
                  <option value="download">Download Speed</option>
                </select>
                <p class="mt-1 text-xs text-gray-500">
                  {getMetricDescription(metric())}
                </p>
              </div>

              <div>
                <label
                  for="edit-condition-select"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Condition *
                </label>
                <select
                  id="edit-condition-select"
                  value={condition()}
                  onChange={e =>
                    setCondition(
                      e.currentTarget.value as "GREATER_THAN" | "LESS_THAN"
                    )
                  }
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading()}
                  required
                >
                  <option value="GREATER_THAN">Greater Than</option>
                  <option value="LESS_THAN">Less Than</option>
                </select>
                <p class="mt-1 text-xs text-gray-500">
                  {getConditionDescription(condition())}
                </p>
              </div>

              <div>
                <label
                  for="edit-threshold-input"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Threshold *
                </label>
                <div class="relative">
                  <input
                    id="edit-threshold-input"
                    type="number"
                    step="0.1"
                    min="0"
                    value={threshold()}
                    onInput={e => setThreshold(e.currentTarget.value)}
                    placeholder={metric() === "ping" ? "100" : "10"}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading()}
                    required
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-sm">
                      {metric() === "ping" ? "ms" : "Mbps"}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center">
                <input
                  id="edit-enabled-checkbox"
                  type="checkbox"
                  checked={enabled()}
                  onChange={e => setEnabled(e.currentTarget.checked)}
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading()}
                />
                <label
                  for="edit-enabled-checkbox"
                  class="ml-2 block text-sm text-gray-900"
                >
                  Enable this alert rule
                </label>
              </div>

              {error() && (
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {error()}
                </div>
              )}
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading()}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading() || !name().trim() || !targetId() || !threshold()
                }
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading() ? "Updating..." : "Update Rule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
