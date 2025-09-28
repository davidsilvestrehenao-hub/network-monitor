import { For, Show } from "solid-js";

interface Incident {
  id: number;
  timestamp: string | Date;
  type: "OUTAGE" | "ALERT";
  description: string;
  resolved: boolean;
  targetId: string;
  ruleId?: number;
}

interface IncidentListProps {
  incidents: Incident[];
}

export function IncidentList(props: IncidentListProps) {
  const formatTime = (date: string | Date): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString();
  };

  const getTypeIcon = (type: string): string => {
    return type === "OUTAGE" ? "🚫" : "⚠️";
  };

  const getTypeColor = (type: string): string => {
    return type === "OUTAGE"
      ? "text-red-600 bg-red-100"
      : "text-yellow-600 bg-yellow-100";
  };

  const getStatusColor = (resolved: boolean): string => {
    return resolved ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100";
  };

  const getStatusText = (resolved: boolean): string => {
    return resolved ? "Resolved" : "Active";
  };

  return (
    <div class="space-y-4">
      <Show when={props.incidents.length === 0}>
        <div class="text-center py-12">
          <div class="text-6xl mb-4">📊</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No incidents recorded
          </h3>
          <p class="text-gray-600">
            Incidents will appear here when alert rules are triggered or outages
            occur.
          </p>
        </div>
      </Show>

      <Show when={props.incidents.length > 0}>
        <div class="space-y-3">
          <For each={props.incidents}>
            {incident => (
              <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-3">
                    <div
                      class={`p-2 rounded-full ${getTypeColor(incident.type)}`}
                    >
                      <span class="text-lg">{getTypeIcon(incident.type)}</span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-2">
                        <h4 class="text-lg font-medium text-gray-900">
                          {incident.description}
                        </h4>
                        <span
                          class={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.resolved)}`}
                        >
                          {getStatusText(incident.resolved)}
                        </span>
                      </div>
                      <div class="text-sm text-gray-600 space-y-1">
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
                        {incident.ruleId && (
                          <div>
                            <span class="font-medium">Rule ID:</span>{" "}
                            {incident.ruleId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div class="flex space-x-2">
                    <Show when={!incident.resolved}>
                      <button class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                        Mark Resolved
                      </button>
                    </Show>
                    <button class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
