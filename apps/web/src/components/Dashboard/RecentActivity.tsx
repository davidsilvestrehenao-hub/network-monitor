import { type Component, For, Show } from "solid-js";
import type { SpeedTestResult } from "@network-monitor/shared";

interface RecentActivityProps {
  results: SpeedTestResult[];
}

export const RecentActivity: Component<RecentActivityProps> = props => {
  const formatTime = (date: Date | string): string => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date | string): string => {
    const now = new Date();
    const testDate = new Date(date);
    const diffInHours = (now.getTime() - testDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return testDate.toLocaleDateString();
    }
  };

  const getStatusIcon = (status: string): string => {
    return status === "SUCCESS" ? "✅" : "❌";
  };

  const getStatusColor = (status: string): string => {
    return status === "SUCCESS"
      ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20"
      : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20";
  };

  return (
    <div class="space-y-3">
      <Show when={props.results.length === 0}>
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-2">📊</div>
          <p>No recent activity</p>
          <p class="text-sm">Run some speed tests to see activity</p>
        </div>
      </Show>

      <Show when={props.results.length > 0}>
        <For each={props.results}>
          {result => (
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="flex items-center space-x-3">
                <div
                  class={`p-2 rounded-full ${getStatusColor(result.status)}`}
                >
                  <span class="text-sm">{getStatusIcon(result.status)}</span>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      Target {result.targetId.slice(-4)}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(result.createdAt)}
                    </span>
                  </div>
                  <div class="text-xs text-gray-600 dark:text-gray-400">
                    {formatTime(result.createdAt)}
                  </div>
                </div>
              </div>

              <div class="text-right">
                <Show when={result.status === "SUCCESS"}>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {result.ping}ms
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {result.download} Mbps
                  </div>
                </Show>
                <Show when={result.status === "FAILURE"}>
                  <div class="text-sm text-red-600 dark:text-red-400">
                    Failed
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-24">
                    {result.error || "Unknown error"}
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
};
