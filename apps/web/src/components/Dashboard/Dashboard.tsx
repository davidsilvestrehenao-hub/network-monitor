import { type Component, For, Show, createResource } from "solid-js";
import { trpc } from "~/lib/trpc";
import { useLogger } from "~/lib/frontend/container";
import { StatsCard } from "./StatsCard";
import { TargetCard, type Target } from "./TargetCard";
import { type TargetStatus } from "./StatusIndicator";

export const Dashboard: Component = () => {
  const logger = useLogger();
  const [targets] = createResource(() => trpc.targets.getAll.query());

  // Mock stats - in real implementation, fetch from API
  const totalTargets = () => targets()?.length || 0;
  const activeTargets = () =>
    targets()?.filter(
      t => (t as Target & { status?: TargetStatus }).status === "healthy"
    ).length || 0;
  const criticalTargets = () =>
    targets()?.filter(
      t => (t as Target & { status?: TargetStatus }).status === "critical"
    ).length || 0;

  const avgPing = () => {
    const pings = targets()
      ?.map(t => (t as Target & { ping?: number }).ping)
      .filter((p): p is number => p !== undefined);
    if (!pings || pings.length === 0) return 0;
    return Math.round(pings.reduce((sum, p) => sum + p, 0) / pings.length);
  };

  return (
    <div class="space-y-6">
      {/* Stats Overview */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Targets"
          value={totalTargets()}
          icon={
            <svg
              class="h-8 w-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Active Targets"
          value={activeTargets()}
          icon={
            <svg
              class="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          }
        />

        <StatsCard
          title="Critical Alerts"
          value={criticalTargets()}
          icon={
            <svg
              class="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Avg Ping"
          value={`${avgPing()}ms`}
          icon={
            <svg
              class="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
        />
      </div>

      {/* Targets Grid */}
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Monitoring Targets
          </h2>
          <button
            type="button"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Target
          </button>
        </div>

        <Show
          when={targets() && targets()!.length > 0}
          fallback={
            <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No targets
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new monitoring target.
              </p>
            </div>
          }
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={targets()}>
              {target => (
                <TargetCard
                  target={target as Target}
                  onEdit={id => logger.info("Edit target", { id })}
                  onDelete={id => logger.info("Delete target", { id })}
                  onToggleMonitoring={id =>
                    logger.info("Toggle monitoring", { id })
                  }
                />
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};
