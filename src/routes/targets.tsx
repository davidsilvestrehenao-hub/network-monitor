import {
  createSignal,
  createEffect,
  For,
  Show,
  createMemo,
  type VoidComponent,
} from "solid-js";
import { useCommandQuery, useEventBus } from "~/lib/frontend/container";
import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
} from "~/lib/services/interfaces/ITargetRepository";
import type {
  FrontendEvents,
  BackendEvents,
} from "~/lib/services/interfaces/IEventBus";
import { TargetCard } from "~/components/TargetCard";
import { AddTargetModal } from "~/components/AddTargetModal";
import { EditTargetModal } from "~/components/EditTargetModal";

const Targets: VoidComponent = () => {
  const commandQuery = useCommandQuery();
  const eventBus = useEventBus();

  const [targets, setTargets] = createSignal<Target[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [showAddModal, setShowAddModal] = createSignal(false);
  const [editingTarget, setEditingTarget] = createSignal<Target | null>(null);
  const [searchTerm, setSearchTerm] = createSignal("");

  // Load targets
  createEffect(() => {
    const loadTargets = async () => {
      setLoading(true);
      setError(null);
      try {
        const targetList = await commandQuery.getTargets();
        setTargets(targetList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load targets");
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

    eventBus.onTyped<BackendEvents["TARGET_CREATED"]>(
      "TARGET_CREATED",
      data => {
        setTargets(prev => [...prev, data as Target]);
        setShowAddModal(false);
      }
    );

    eventBus.onTyped<BackendEvents["TARGET_UPDATED"]>(
      "TARGET_UPDATED",
      data => {
        setTargets(prev =>
          prev.map(t =>
            t.id === data.id
              ? { ...t, name: data.name, address: data.address }
              : t
          )
        );
        setEditingTarget(null);
      }
    );

    eventBus.onTyped<BackendEvents["TARGET_DELETED"]>(
      "TARGET_DELETED",
      data => {
        setTargets(prev => prev.filter(t => t.id !== data.id));
      }
    );
  });

  const handleCreateTarget = async (data: CreateTargetData) => {
    try {
      await commandQuery.createTarget(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create target");
    }
  };

  const handleUpdateTarget = async (id: string, data: UpdateTargetData) => {
    try {
      await commandQuery.updateTarget(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update target");
    }
  };

  const handleDeleteTarget = async (id: string) => {
    if (confirm("Are you sure you want to delete this target?")) {
      try {
        await commandQuery.deleteTarget(id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete target"
        );
      }
    }
  };

  const handleRunSpeedTest = async (id: string) => {
    try {
      await commandQuery.runSpeedTest(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run speed test");
    }
  };

  const handleStartMonitoring = async (id: string) => {
    try {
      await commandQuery.startMonitoring(id, 30000); // 30 seconds
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start monitoring"
      );
    }
  };

  const handleStopMonitoring = async (id: string) => {
    try {
      await commandQuery.stopMonitoring(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to stop monitoring"
      );
    }
  };

  // Filter targets based on search term
  const filteredTargets = createMemo(() => {
    const term = searchTerm().toLowerCase();
    if (!term) return targets();
    return targets().filter(
      target =>
        target.name.toLowerCase().includes(term) ||
        target.address.toLowerCase().includes(term)
    );
  });

  return (
    <div>
        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                Monitoring Targets
              </h1>
              <p class="text-gray-600">
                Manage your internet connection monitoring targets
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Target
            </button>
          </div>

          {/* Search */}
          <div class="max-w-md">
            <input
              type="text"
              placeholder="Search targets..."
              value={searchTerm()}
              onInput={e => setSearchTerm(e.currentTarget.value)}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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
            <p class="mt-4 text-gray-600">Loading targets...</p>
          </div>
        )}

        <Show when={!loading()}>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={filteredTargets()}>
              {target => (
                <TargetCard
                  target={target}
                  onEdit={() => setEditingTarget(target)}
                  onDelete={() => handleDeleteTarget(target.id)}
                  onRunTest={() => handleRunSpeedTest(target.id)}
                  onStartMonitoring={() => handleStartMonitoring(target.id)}
                  onStopMonitoring={() => handleStopMonitoring(target.id)}
                />
              )}
            </For>
          </div>

          {filteredTargets().length === 0 && (
            <div class="text-center py-12">
              <div class="text-6xl mb-4">🎯</div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {searchTerm() ? "No targets found" : "No targets yet"}
              </h3>
              <p class="text-gray-600 mb-6">
                {searchTerm()
                  ? "Try adjusting your search terms"
                  : "Add your first monitoring target to get started"}
              </p>
              {!searchTerm() && (
                <button
                  onClick={() => setShowAddModal(true)}
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Your First Target
                </button>
              )}
            </div>
          )}
        </Show>
      </div>
    </div>

    {/* Modals */}
    <Show when={showAddModal()}>
        <AddTargetModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateTarget}
        />
      </Show>

      <Show when={editingTarget()}>
        <EditTargetModal
          target={editingTarget() as Target}
          onClose={() => setEditingTarget(null)}
          onSubmit={handleUpdateTarget}
        />
      </Show>
    </div>
  );
};

export default Targets;
