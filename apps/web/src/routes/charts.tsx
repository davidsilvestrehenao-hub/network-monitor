import {
  createSignal,
  createResource,
  createEffect,
  For,
  Show,
  createMemo,
} from "solid-js";
import { trpc } from "~/lib/trpc";
import {
  AppLayout,
  PingChart,
  DownloadChart,
  SuccessRateChart,
} from "~/components";
import type { Target } from "@network-monitor/shared";

export default function ChartsPage() {
  const [targets] = createResource(() => trpc.targets.getAll.query());
  const [selectedTargets, setSelectedTargets] = createSignal<string[]>([]);
  const [timeRange, setTimeRange] = createSignal<"1h" | "24h" | "7d" | "30d">(
    "24h"
  );

  // Auto-select all targets when loaded
  createEffect(() => {
    const targetList = targets();
    if (targetList && selectedTargets().length === 0) {
      setSelectedTargets(targetList.map(t => t.id));
    }
  });

  // Get filtered targets based on selection
  const filteredTargets = createMemo(() => {
    const targetList = targets();
    if (!targetList) return [];
    return (targetList as unknown as Target[]).filter(target =>
      selectedTargets().includes(target.id)
    );
  });

  const handleTargetToggle = (targetId: string) => {
    setSelectedTargets(prev =>
      prev.includes(targetId)
        ? prev.filter(id => id !== targetId)
        : [...prev, targetId]
    );
  };

  const handleSelectAll = () => {
    const targetList = targets();
    if (targetList) {
      setSelectedTargets(targetList.map(t => t.id));
    }
  };

  const handleSelectNone = () => {
    setSelectedTargets([]);
  };

  return (
    <AppLayout>
      <div>
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Performance Charts
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Analyze historical performance data and trends
          </p>
        </div>

        {/* Controls */}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Target Selection */}
            <div class="flex-1">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Targets
              </h3>
              <div class="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  class="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleSelectNone}
                  class="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Select None
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <For each={(targets() || []) as unknown as Target[]}>
                  {target => (
                    <button
                      type="button"
                      onClick={() => handleTargetToggle(target.id)}
                      class={`px-3 py-1 text-xs rounded-md transition-colors ${
                        selectedTargets().includes(target.id)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {target.name}
                    </button>
                  )}
                </For>
              </div>
            </div>

            {/* Time Range Selection */}
            <div class="lg:w-48">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Time Range
              </h3>
              <select
                value={timeRange()}
                onChange={e =>
                  setTimeRange(
                    e.currentTarget.value as "1h" | "24h" | "7d" | "30d"
                  )
                }
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Charts */}
        <Show when={selectedTargets().length > 0}>
          <div class="space-y-6">
            {/* Ping Chart */}
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ping Performance
              </h3>
              <PingChart targets={filteredTargets()} timeRange={timeRange()} />
            </div>

            {/* Download Speed Chart */}
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Download Speed
              </h3>
              <DownloadChart
                targets={filteredTargets()}
                timeRange={timeRange()}
              />
            </div>

            {/* Success Rate Chart */}
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Success Rate
              </h3>
              <SuccessRateChart
                targets={filteredTargets()}
                timeRange={timeRange()}
              />
            </div>
          </div>
        </Show>

        <Show when={selectedTargets().length === 0}>
          <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="text-6xl mb-4">📈</div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No targets selected
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Select one or more targets to view their performance charts
            </p>
            <button
              type="button"
              onClick={handleSelectAll}
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Select All Targets
            </button>
          </div>
        </Show>
      </div>
    </AppLayout>
  );
}
