import { type Component, For, Show } from "solid-js";
import type { IncidentEvent } from "@network-monitor/shared";

interface IncidentListProps {
  incidents: IncidentEvent[];
  onResolve?: (id: number) => void;
  onViewDetails?: (id: number) => void;
}

export const IncidentList: Component<IncidentListProps> = props => {
  const formatTime = (date: string | Date): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString();
  };

  const getTypeIcon = (type: string): string => {
    return type === "OUTAGE" ? "🚫" : "⚠️";
  };

  const getTypeColor = (type: string): string => {
    return type === "OUTAGE"
      ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20"
      : "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20";
  };

  const getStatusColor = (resolved: boolean): string => {
    return resolved
      ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20"
      : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20";
  };

  const getStatusText = (resolved: boolean): string => {
    return resolved ? "Resolved" : "Active";
  };

  return (
    <div class="space-y-4">
      <Show when={props.incidents.length === 0}>
        <div class="text-center py-12">
          <div class="text-6xl mb-4">📊</div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No incidents recorded
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Incidents will appear here when alert rules are triggered or outages
            occur.
          </p>
        </div>
      </Show>

      <Show when={props.incidents.length > 0}>
        <div class="space-y-3">
          <For each={props.incidents}>
            {incident => (
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-3 flex-1">
                    <div
                      class={`p-2 rounded-full ${getTypeColor(incident.type)}`}
                    >
                      <span class="text-lg">{getTypeIcon(incident.type)}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center space-x-2 mb-2">
                        <h4 class="text-lg font-medium text-gray-900 dark:text-white">
                          {incident.description}
                        </h4>
                        <span
                          class={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.resolved)}`}
                        >
                          {getStatusText(incident.resolved)}
                        </span>
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>
                          <span class="font-medium">Type:</span> {incident.type}
                        </div>
                        <div>
                          <span class="font-medium">Time:</span>{" "}
                          {formatTime(incident.timestamp)}
                        </div>
                        <div>
                          <span class="font-medium">Target:</span>{" "}
                          {incident.targetId.slice(-4)}
                        </div>
                        <Show when={incident.ruleId}>
                          <div>
                            <span class="font-medium">Rule ID:</span>{" "}
                            {incident.ruleId}
                          </div>
                        </Show>
                      </div>
                    </div>
                  </div>

                  <div class="flex space-x-2 ml-4">
                    <Show when={!incident.resolved && props.onResolve}>
                      <button
                        type="button"
                        onClick={() => props.onResolve?.(incident.id)}
                        class="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                      >
                        Mark Resolved
                      </button>
                    </Show>
                    <Show when={props.onViewDetails}>
                      <button
                        type="button"
                        onClick={() => props.onViewDetails?.(incident.id)}
                        class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        View Details
                      </button>
                    </Show>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
