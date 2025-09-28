import {
  createSignal,
  createEffect,
  For,
  Show,
  type VoidComponent,
} from "solid-js";
import {
  FrontendServicesProvider,
  useCommandQuery,
} from "~/lib/frontend/container";
import { Target, AlertRule } from "~/lib/services/interfaces/ITargetRepository";
import { AlertRuleData, Incident } from "~/lib/frontend/interfaces/IAPIClient";
import { Navigation } from "~/components/Navigation";
import { AlertRuleCard } from "~/components/AlertRuleCard";
import { AddAlertRuleModal } from "~/components/AddAlertRuleModal";
import { EditAlertRuleModal } from "~/components/EditAlertRuleModal";
import { IncidentList } from "~/components/IncidentList";

const Alerts: VoidComponent = () => {
  const commandQuery = useCommandQuery();

  const [targets, setTargets] = createSignal<Target[]>([]);
  const [alertRules, setAlertRules] = createSignal<AlertRule[]>([]);
  const [incidents, setIncidents] = createSignal<Incident[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [showAddModal, setShowAddModal] = createSignal(false);
  const [editingRule, setEditingRule] = createSignal<AlertRule | null>(null);
  const [activeTab, setActiveTab] = createSignal<"rules" | "incidents">(
    "rules"
  );

  // Load data
  createEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const targetList = await commandQuery.getTargets();
        setTargets(targetList);

        // Extract all alert rules from targets
        const allRules = targetList.flatMap(target => target.alertRules);
        setAlertRules(allRules);

        // TODO: Load incidents from API
        setIncidents([]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load alert data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  });

  const handleCreateRule = async (data: AlertRuleData) => {
    try {
      // TODO: Implement create alert rule
      console.log("Creating alert rule:", data);
      setShowAddModal(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create alert rule"
      );
    }
  };

  const handleUpdateRule = async (id: number, data: Partial<AlertRuleData>) => {
    try {
      // TODO: Implement update alert rule
      console.log("Updating alert rule:", id, data);
      setEditingRule(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update alert rule"
      );
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (confirm("Are you sure you want to delete this alert rule?")) {
      try {
        // TODO: Implement delete alert rule
        console.log("Deleting alert rule:", id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete alert rule"
        );
      }
    }
  };

  const handleToggleRule = async (id: number, enabled: boolean) => {
    try {
      // TODO: Implement toggle alert rule
      console.log("Toggling alert rule:", id, enabled);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle alert rule"
      );
    }
  };

  return (
    <FrontendServicesProvider>
      <Navigation>
        <div class="p-6">
          <div class="mb-8">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                  Alerts & Incidents
                </h1>
                <p class="text-gray-600">
                  Manage alert rules and monitor incidents
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Alert Rule
              </button>
            </div>

            {/* Tabs */}
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("rules")}
                  class={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab() === "rules"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Alert Rules ({alertRules().length})
                </button>
                <button
                  onClick={() => setActiveTab("incidents")}
                  class={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab() === "incidents"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Incidents ({incidents().length})
                </button>
              </nav>
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
              <p class="mt-4 text-gray-600">Loading alerts...</p>
            </div>
          )}

          <Show when={!loading()}>
            {/* Alert Rules Tab */}
            <Show when={activeTab() === "rules"}>
              <div class="space-y-4">
                <Show when={alertRules().length === 0}>
                  <div class="text-center py-12">
                    <div class="text-6xl mb-4">🚨</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">
                      No alert rules configured
                    </h3>
                    <p class="text-gray-600 mb-6">
                      Create alert rules to get notified when performance
                      thresholds are exceeded
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Alert Rule
                    </button>
                  </div>
                </Show>

                <Show when={alertRules().length > 0}>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <For each={alertRules()}>
                      {rule => (
                        <AlertRuleCard
                          rule={rule}
                          target={targets().find(t => t.id === rule.targetId)}
                          onEdit={() => setEditingRule(rule)}
                          onDelete={() => handleDeleteRule(rule.id)}
                          onToggle={enabled =>
                            handleToggleRule(rule.id, enabled)
                          }
                        />
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Incidents Tab */}
            <Show when={activeTab() === "incidents"}>
              <IncidentList incidents={incidents()} />
            </Show>
          </Show>
        </div>

        {/* Modals */}
        <Show when={showAddModal()}>
          <AddAlertRuleModal
            targets={targets()}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleCreateRule}
          />
        </Show>

        <Show when={editingRule()}>
          <EditAlertRuleModal
            rule={editingRule() as AlertRule}
            targets={targets()}
            onClose={() => setEditingRule(null)}
            onSubmit={handleUpdateRule}
          />
        </Show>
      </Navigation>
    </FrontendServicesProvider>
  );
};

export default Alerts;
