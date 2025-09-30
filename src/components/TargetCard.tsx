import { createSignal, createEffect, For, Show } from "solid-js";
import type {
  Target,
  SpeedTestResult,
} from "~/lib/services/interfaces/ITargetRepository";

interface TargetCardProps {
  target: Target;
  onEdit: () => void;
  onDelete: () => void;
  onRunTest: () => void;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
}

export function TargetCard(props: TargetCardProps) {
  const [isMonitoring, setIsMonitoring] = createSignal(false);
  const [latestResult, setLatestResult] = createSignal<SpeedTestResult | null>(
    null
  );

  // Get the latest speed test result
  createEffect(() => {
    const results = props.target.speedTestResults;
    if (results.length > 0) {
      const latest = results.reduce((latest, current) =>
        new Date(current.createdAt) > new Date(latest.createdAt)
          ? current
          : latest
      );
      setLatestResult(latest);
    }
  });

  const getStatusColor = (status: "SUCCESS" | "FAILURE"): string => {
    return status === "SUCCESS" ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = (status: "SUCCESS" | "FAILURE"): string => {
    return status === "SUCCESS" ? "✅" : "❌";
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const testDate = new Date(date);
    const diffInMinutes = (now.getTime() - testDate.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else {
      return testDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            {props.target.name}
          </h3>
          <p class="text-sm text-gray-600 break-all">{props.target.address}</p>
        </div>
        <div class="flex space-x-1 ml-2">
          <button
            onClick={() => props.onEdit()}
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit target"
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
            title="Delete target"
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

      {/* Status */}
      <div class="mb-4">
        <Show when={latestResult()}>
          {result => (
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class={`text-sm ${getStatusColor(result().status)}`}>
                  {getStatusIcon(result().status)}
                </span>
                <span class="text-sm text-gray-600">
                  {formatTime(result().createdAt)}
                </span>
              </div>
              <Show when={result().status === "SUCCESS"}>
                <div class="text-sm font-medium text-gray-900">
                  {result().ping}ms / {result().download}Mbps
                </div>
              </Show>
            </div>
          )}
        </Show>
        <Show when={!latestResult()}>
          <div class="text-sm text-gray-500">No tests run yet</div>
        </Show>
      </div>

      {/* Stats */}
      <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span class="text-gray-500">Tests:</span>
          <span class="ml-1 font-medium">
            {props.target.speedTestResults.length}
          </span>
        </div>
        <div>
          <span class="text-gray-500">Alerts:</span>
          <span class="ml-1 font-medium">{props.target.alertRules.length}</span>
        </div>
      </div>

      {/* Actions */}
      <div class="space-y-2">
        <div class="flex space-x-2">
          <button
            onClick={() => props.onRunTest()}
            class="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Test Now
          </button>
          <Show when={!isMonitoring()}>
            <button
              onClick={() => {
                props.onStartMonitoring();
                setIsMonitoring(true);
              }}
              class="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 transition-colors"
            >
              Start
            </button>
          </Show>
          <Show when={isMonitoring()}>
            <button
              onClick={() => {
                props.onStopMonitoring();
                setIsMonitoring(false);
              }}
              class="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Stop
            </button>
          </Show>
        </div>
      </div>

      {/* Recent Results */}
      <Show when={props.target.speedTestResults.length > 0}>
        <div class="mt-4 pt-4 border-t border-gray-200">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Recent Results</h4>
          <div class="space-y-1">
            <For each={props.target.speedTestResults.slice(0, 3)}>
              {result => (
                <div class="flex justify-between items-center text-xs">
                  <div class="flex items-center space-x-1">
                    <span class={getStatusColor(result.status)}>
                      {getStatusIcon(result.status)}
                    </span>
                    <span class="text-gray-600">
                      {formatTime(result.createdAt)}
                    </span>
                  </div>
                  <Show when={result.status === "SUCCESS"}>
                    <span class="text-gray-900">{result.ping}ms</span>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
