import { createSignal, createEffect, For } from "solid-js";
import { useCommandQuery, useEventBus } from "~/lib/frontend/container";
import type { Target } from "~/lib/services/interfaces/ITargetRepository";
import type { FrontendEvents } from "~/lib/services/interfaces/IEventBus";

export function TargetList() {
  const commandQuery = useCommandQuery();
  const eventBus = useEventBus();
  const [targets, setTargets] = createSignal<Target[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Load targets on mount
  createEffect(() => {
    const loadTargets = async () => {
      setLoading(true);
      setError(null);
      try {
        const targetList = await commandQuery.getTargets();
        setTargets(targetList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadTargets();
  });

  // Listen for target events
  createEffect(() => {
    eventBus.onTyped<FrontendEvents["TARGETS_LOADED"]>(
      "TARGETS_LOADED",
      data => {
        setTargets(data.targets as Target[]);
      }
    );

    eventBus.onTyped<FrontendEvents["TARGETS_LOAD_FAILED"]>(
      "TARGETS_LOAD_FAILED",
      data => {
        setError(data.error);
      }
    );
  });

  const handleDeleteTarget = async (id: string) => {
    if (confirm("Are you sure you want to delete this target?")) {
      try {
        await commandQuery.deleteTarget(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }
  };

  const handleRunSpeedTest = async (id: string) => {
    try {
      await commandQuery.runSpeedTest(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-gray-900">Monitoring Targets</h2>

      {loading() && (
        <div class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p class="mt-2 text-gray-600">Loading targets...</p>
        </div>
      )}

      {error() && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong class="font-bold">Error: </strong>
          <span class="block sm:inline"> {error()}</span>
        </div>
      )}

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <For each={targets()}>
          {target => (
            <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-gray-900">
                  {target.name}
                </h3>
                <div class="flex space-x-2">
                  <button
                    onClick={() => handleRunSpeedTest(target.id)}
                    class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleDeleteTarget(target.id)}
                    class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p class="text-gray-600 mb-4">{target.address}</p>

              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Speed Tests:</span>
                  <span class="font-medium">
                    {target.speedTestResults.length}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Alert Rules:</span>
                  <span class="font-medium">{target.alertRules.length}</span>
                </div>
              </div>

              {target.speedTestResults.length > 0 && (
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">
                    Latest Results
                  </h4>
                  <div class="space-y-1">
                    <For each={target.speedTestResults.slice(0, 3)}>
                      {result => (
                        <div class="flex justify-between text-xs text-gray-600">
                          <span>
                            {result.status === "SUCCESS" ? "✅" : "❌"}
                            {new Date(result.createdAt).toLocaleTimeString()}
                          </span>
                          {result.status === "SUCCESS" && (
                            <span>
                              {result.ping}ms / {result.download}Mbps
                            </span>
                          )}
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </div>
          )}
        </For>
      </div>

      {targets().length === 0 && !loading() && (
        <div class="text-center py-8 text-gray-500">
          <p>
            No targets found. Add your first monitoring target to get started.
          </p>
        </div>
      )}
    </div>
  );
}
