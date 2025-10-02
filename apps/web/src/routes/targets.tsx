import { For, createResource, createSignal, Suspense, Show } from "solid-js";
import { trpc } from "~/lib/trpc";
import { logger } from "~/lib/logger";
import {
  AppLayout,
  TargetCard,
  TargetForm,
  type Target,
  type TargetFormData,
} from "~/components";

export default function TargetsPage() {
  const [targets, { refetch }] = createResource(() =>
    trpc.targets.getAll.query()
  );
  const [showAddForm, setShowAddForm] = createSignal(false);

  const handleSubmit = async (data: TargetFormData) => {
    try {
      await trpc.targets.create.mutate(data);
      logger.info("Target created successfully", { name: data.name });
      setShowAddForm(false);
      refetch();
    } catch (error) {
      logger.error("Failed to create target", { error });
      throw error; // Let the form handle the error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this target?")) return;

    try {
      await trpc.targets.delete.mutate({ id });
      logger.info("Target deleted successfully", { id });
      refetch();
    } catch (error) {
      logger.error("Failed to delete target", { error });
      alert("Failed to delete target. See console for details.");
    }
  };

  return (
    <AppLayout>
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Monitoring Targets
          </h1>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm())}
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {showAddForm() ? "Cancel" : "Add Target"}
          </button>
        </div>

        <Show when={showAddForm()}>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add New Target
            </h2>
            <TargetForm
              onSubmit={handleSubmit}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </Show>

        <Suspense fallback={<p class="text-gray-500">Loading targets...</p>}>
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
                    onDelete={handleDelete}
                    onToggleMonitoring={id =>
                      logger.info("Toggle monitoring", { id })
                    }
                  />
                )}
              </For>
            </div>
          </Show>
        </Suspense>
      </div>
    </AppLayout>
  );
}
