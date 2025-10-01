import { createResource, For, Show, createSignal } from "solid-js";
import { trpc } from "~/lib/trpc";
import { useLogger } from "~/lib/frontend/container";
import type { Notification as NotificationType } from "@network-monitor/shared";
import {
  AppLayout,
  NotificationCard,
  PushSubscriptionCard,
  TestNotificationModal,
  type TestNotificationData,
} from "~/components";

export default function NotificationsPage() {
  const logger = useLogger();
  const [notifications, { refetch: refetchNotifications }] = createResource(
    () => trpc.notifications.getByUserId.query({ userId: "mock-user" })
  );
  const [pushSubscriptions, { refetch: refetchSubscriptions }] = createResource(
    () => trpc.pushSubscriptions.getByUserId.query()
  );

  const [showTestModal, setShowTestModal] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<
    "notifications" | "subscriptions"
  >("notifications");

  const handleMarkAsRead = async (id: number) => {
    try {
      await trpc.notifications.markAsRead.mutate({ id });
      logger.info("Notification marked as read", { id });
      refetchNotifications();
    } catch (error) {
      logger.error("Failed to mark notification as read", { error });
      alert("Failed to mark notification as read. See console for details.");
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      await trpc.pushSubscriptions.delete.mutate({ id });
      logger.info("Push subscription deleted", { id });
      refetchSubscriptions();
    } catch (error) {
      logger.error("Failed to delete push subscription", { error });
      alert("Failed to delete push subscription. See console for details.");
    }
  };

  const handleSendTest = async (data: TestNotificationData) => {
    try {
      // TODO: Add sendTest procedure - for now just create a notification
      logger.info("Test notification (create not implemented)", {
        message: data.message,
      });
      logger.info("Test notification sent", { message: data.message });
      setShowTestModal(false);
      refetchNotifications();
    } catch (error) {
      logger.error("Failed to send test notification", { error });
      throw error;
    }
  };

  const unreadCount = () =>
    notifications()?.filter((n: { read: boolean }) => !n.read).length || 0;

  return (
    <AppLayout>
      <div>
        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Notifications
              </h1>
              <p class="text-gray-600 dark:text-gray-400">
                Manage notifications and push subscriptions
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTestModal(true)}
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Send Test
            </button>
          </div>

          {/* Tabs */}
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab("notifications")}
                class={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab() === "notifications"
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                Notifications ({notifications()?.length || 0})
                <Show when={unreadCount() > 0}>
                  <span class="ml-2 px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                    {unreadCount()}
                  </span>
                </Show>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("subscriptions")}
                class={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab() === "subscriptions"
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                Push Subscriptions ({pushSubscriptions()?.length || 0})
              </button>
            </nav>
          </div>
        </div>

        <div class="mt-6">
          {/* Notifications Tab */}
          <Show when={activeTab() === "notifications"}>
            <Show
              when={notifications() && notifications()!.length > 0}
              fallback={
                <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div class="text-6xl mb-4">🔔</div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No notifications
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    You'll see notifications here when alerts are triggered
                  </p>
                </div>
              }
            >
              <div class="space-y-4">
                <For each={notifications()}>
                  {notification => (
                    <NotificationCard
                      notification={notification as unknown as NotificationType}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  )}
                </For>
              </div>
            </Show>
          </Show>

          {/* Push Subscriptions Tab */}
          <Show when={activeTab() === "subscriptions"}>
            <Show
              when={pushSubscriptions() && pushSubscriptions()!.length > 0}
              fallback={
                <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div class="text-6xl mb-4">📱</div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No push subscriptions
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Enable push notifications in settings to receive alerts
                  </p>
                  <a
                    href="/settings"
                    class="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Go to Settings
                  </a>
                </div>
              }
            >
              <div class="space-y-4">
                <For each={pushSubscriptions()}>
                  {subscription => (
                    <PushSubscriptionCard
                      subscription={subscription}
                      onDelete={handleDeleteSubscription}
                    />
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>

        {/* Test Notification Modal */}
        <Show when={showTestModal()}>
          <TestNotificationModal
            onClose={() => setShowTestModal(false)}
            onSubmit={handleSendTest}
          />
        </Show>
      </div>
    </AppLayout>
  );
}
