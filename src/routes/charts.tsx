import {
  createSignal,
  createEffect,
  For,
  Show,
  createMemo,
  type VoidComponent,
} from "solid-js";
import {
  FrontendServicesProvider,
  useCommandQuery,
} from "~/lib/frontend/container";
import { Target } from "~/lib/services/interfaces/ITargetRepository";
import { Navigation } from "~/components/Navigation";
import { PingChart } from "~/components/PingChart";
import { DownloadChart } from "~/components/DownloadChart";
import { SuccessRateChart } from "~/components/SuccessRateChart";

const Charts: VoidComponent = () => {
  const commandQuery = useCommandQuery();

  const [targets, setTargets] = createSignal<Target[]>([]);
  const [selectedTargets, setSelectedTargets] = createSignal<string[]>([]);
  const [timeRange, setTimeRange] = createSignal<"1h" | "24h" | "7d" | "30d">(
    "24h"
  );
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Load targets
  createEffect(() => {
    const loadTargets = async () => {
      setLoading(true);
      setError(null);
      try {
        const targetList = await commandQuery.getTargets();
        setTargets(targetList);
        // Select all targets by default
        setSelectedTargets(targetList.map(t => t.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load targets");
      } finally {
        setLoading(false);
      }
    };

    loadTargets();
  });

  // Get filtered targets based on selection
  const filteredTargets = createMemo(() => {
    return targets().filter(target => selectedTargets().includes(target.id));
  });

  const handleTargetToggle = (targetId: string) => {
    setSelectedTargets(prev =>
      prev.includes(targetId)
        ? prev.filter(id => id !== targetId)
        : [...prev, targetId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTargets(targets().map(t => t.id));
  };

  const handleSelectNone = () => {
    setSelectedTargets([]);
  };

  return (
    <FrontendServicesProvider>
      <Navigation>
        <div class="p-6">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              Performance Charts
            </h1>
            <p class="text-gray-600">
              Analyze historical performance data and trends
            </p>
          </div>

          {error() && (
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong class="font-bold">Error:</strong>
              <span class="block sm:inline"> {error()}</span>
            </div>
          )}

          {loading() && (
            <div class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              <p class="mt-4 text-gray-600">Loading charts...</p>
            </div>
          )}

          <Show when={!loading()}>
            {/* Controls */}
            <div class="bg-white rounded-lg shadow p-6 mb-6">
              <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Target Selection */}
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-700 mb-3">
                    Select Targets
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <button
                      onClick={handleSelectAll}
                      class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleSelectNone}
                      class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Select None
                    </button>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <For each={targets()}>
                      {target => (
                        <button
                          onClick={() => handleTargetToggle(target.id)}
                          class={`px-3 py-1 text-xs rounded-md transition-colors ${
                            selectedTargets().includes(target.id)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  <h3 class="text-sm font-medium text-gray-700 mb-3">
                    Time Range
                  </h3>
                  <select
                    value={timeRange()}
                    onChange={e =>
                      setTimeRange(
                        e.currentTarget.value as "1h" | "24h" | "7d" | "30d"
                      )
                    }
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div class="bg-white rounded-lg shadow p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    Ping Performance
                  </h3>
                  <PingChart
                    targets={filteredTargets()}
                    timeRange={timeRange()}
                  />
                </div>

                {/* Download Speed Chart */}
                <div class="bg-white rounded-lg shadow p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    Download Speed
                  </h3>
                  <DownloadChart
                    targets={filteredTargets()}
                    timeRange={timeRange()}
                  />
                </div>

                {/* Success Rate Chart */}
                <div class="bg-white rounded-lg shadow p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
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
              <div class="text-center py-12">
                <div class="text-6xl mb-4">📈</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  No targets selected
                </h3>
                <p class="text-gray-600 mb-6">
                  Select one or more targets to view their performance charts
                </p>
                <button
                  onClick={handleSelectAll}
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Select All Targets
                </button>
              </div>
            </Show>
          </Show>
        </div>
      </Navigation>
    </FrontendServicesProvider>
  );
};

export default Charts;
