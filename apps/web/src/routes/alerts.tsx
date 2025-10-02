import { createSignal, createResource, For, Show } from "solid-js";
import { trpc } from "~/lib/trpc";
import { logger } from "~/lib/logger";
import {
  AppLayout,
  AlertRuleCard,
  AddAlertRuleModal,
  EditAlertRuleModal,
  IncidentList,
  type AlertRuleFormData,
} from "~/components";
import type { AlertRule, IncidentEvent, Target } from "@network-monitor/shared";

export default function AlertsPage() {
  const [targets] = createResource(() => trpc.targets.getAll.query());
  const [alertRules, { refetch: refetchRules }] = createResource(() =>
    trpc.alertRules.getAll.query()
  );
  const [incidents, { refetch: refetchIncidents }] = createResource(() =>
    trpc.incidents.getAll.query()
  );

  const [showAddModal, setShowAddModal] = createSignal(false);
  const [editingRule, setEditingRule] = createSignal<AlertRule | null>(null);
  const [activeTab, setActiveTab] = createSignal<"rules" | "incidents">(
    "rules"
  );

  const handleCreateRule = async (data: AlertRuleFormData) => {
    try {
      await trpc.alertRules.create.mutate(data);
      logger.info("Alert rule created successfully", { name: data.name });
      setShowAddModal(false);
      refetchRules();
    } catch (error) {
      logger.error("Failed to create alert rule", { error });
      throw error;
    }
  };

  const handleUpdateRule = async (id: string, data: AlertRuleFormData) => {
    try {
      await trpc.alertRules.update.mutate({ id, ...data });
      logger.info("Alert rule updated successfully", { id });
      setEditingRule(null);
      refetchRules();
    } catch (error) {
      logger.error("Failed to update alert rule", { error });
      throw error;
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this alert rule?")) return;

    try {
      await trpc.alertRules.delete.mutate({ id });
      logger.info("Alert rule deleted successfully", { id });
      refetchRules();
    } catch (error) {
      logger.error("Failed to delete alert rule", { error });
      alert("Failed to delete alert rule. See console for details.");
    }
  };

  const handleToggleRule = async (id: string, enabled: boolean) => {
    try {
      await trpc.alertRules.update.mutate({ id, enabled });
      logger.info("Alert rule toggled", { id, enabled });
      refetchRules();
    } catch (error) {
      logger.error("Failed to toggle alert rule", { error });
      alert("Failed to toggle alert rule. See console for details.");
    }
  };

  const handleResolveIncident = async (id: string) => {
    try {
      await trpc.incidents.resolve.mutate({ id });
      logger.info("Incident resolved", { id });
      refetchIncidents();
    } catch (error) {
      logger.error("Failed to resolve incident", { error });
      alert("Failed to resolve incident. See console for details.");
    }
  };

  return (
    <AppLayout>
      <div>
        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Alerts & Incidents
              </h1>
              <p class="text-gray-600 dark:text-gray-400">
                Manage alert rules and monitor incidents
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add Alert Rule
            </button>
          </div>

          {/* Tabs */}
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab("rules")}
                class={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab() === "rules"
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                Alert Rules ({alertRules()?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("incidents")}
                class={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab() === "incidents"
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                Incidents ({incidents()?.length || 0})
              </button>
            </nav>
          </div>
        </div>

        <div class="mt-6">
          {/* Alert Rules Tab */}
          <Show when={activeTab() === "rules"}>
            <Show
              when={alertRules() && alertRules()!.length > 0}
              fallback={
                <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div class="text-6xl mb-4">🚨</div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No alert rules configured
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Create alert rules to get notified when performance
                    thresholds are exceeded
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Create Your First Alert Rule
                  </button>
                </div>
              }
            >
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <For each={alertRules()}>
                  {rule => (
                    <AlertRuleCard
                      rule={rule as unknown as AlertRule}
                      target={
                        targets()?.find(
                          t => t.id === rule.targetId
                        ) as unknown as Target | undefined
                      }
                      onEdit={() =>
                        setEditingRule(rule as unknown as AlertRule)
                      }
                      onDelete={() => handleDeleteRule(rule.id.toString())}
                      onToggle={enabled =>
                        handleToggleRule(rule.id.toString(), enabled)
                      }
                    />
                  )}
                </For>
              </div>
            </Show>
          </Show>

          {/* Incidents Tab */}
          <Show when={activeTab() === "incidents"}>
            <IncidentList
              incidents={(incidents() as unknown as IncidentEvent[]) || []}
              onResolve={handleResolveIncident}
              onViewDetails={id => logger.info("View incident details", { id })}
            />
          </Show>
        </div>

        {/* Modals */}
        <Show when={showAddModal()}>
          <AddAlertRuleModal
            targets={(targets() || []) as unknown as Target[]}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleCreateRule}
          />
        </Show>

        <Show when={editingRule()}>
          <EditAlertRuleModal
            rule={editingRule() as AlertRule}
            targets={(targets() || []) as unknown as Target[]}
            onClose={() => setEditingRule(null)}
            onSubmit={handleUpdateRule}
          />
        </Show>
      </div>
    </AppLayout>
  );
}
