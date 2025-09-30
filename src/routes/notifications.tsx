import {
  createSignal,
  createEffect,
  For,
  Show,
  type VoidComponent,
} from "solid-js";
import { useLogger } from "~/lib/frontend/container";
import type {
  Notification,
  PushSubscription,
  TestNotificationData,
} from "~/lib/frontend/interfaces/IAPIClient";
import { NotificationCard } from "~/components/NotificationCard";
import { PushSubscriptionCard } from "~/components/PushSubscriptionCard";
import { TestNotificationModal } from "~/components/TestNotificationModal";

const NotificationsContent: VoidComponent = () => {
  const logger = useLogger();
  const [notifications, setNotifications] = createSignal<Notification[]>([]);
  const [pushSubscriptions, setPushSubscriptions] = createSignal<
    PushSubscription[]
  >([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [showTestModal, setShowTestModal] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<
    "notifications" | "subscriptions"
  >("notifications");

  // Load data
  createEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Load notifications and push subscriptions from API
        setNotifications([]);
        setPushSubscriptions([]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load notification data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  });

  const handleMarkAsRead = async (id: number) => {
    try {
      // TODO: Implement mark as read
      logger.info("Marking notification as read", { notificationId: id });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read"
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // TODO: Implement mark all as read
      logger.info("Marking all notifications as read");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark all notifications as read"
      );
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (confirm("Are you sure you want to delete this push subscription?")) {
      try {
        // TODO: Implement delete subscription
        logger.info("Deleting push subscription", { subscriptionId: id });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete push subscription"
        );
      }
    }
  };

  const handleTestNotification = async (data: TestNotificationData) => {
    try {
      // TODO: Implement test notification
      logger.info("Sending test notification", { notificationData: data });
      setShowTestModal(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send test notification"
      );
    }
  };

  return (
    <div>
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              Notifications
            </h1>
            <p class="text-gray-600">
              Manage push notifications and view notification history
            </p>
          </div>
          <div class="flex space-x-3">
              <button
                onClick={() => setShowTestModal(true)}
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Test Notification
              </button>
              <button
                onClick={handleMarkAllAsRead}
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Mark All Read
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("notifications")}
                class={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab() === "notifications"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Notifications ({notifications().length})
              </button>
              <button
                onClick={() => setActiveTab("subscriptions")}
                class={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab() === "subscriptions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Push Subscriptions ({pushSubscriptions().length})
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
            <p class="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        )}

        <Show when={!loading()}>
          {/* Notifications Tab */}
          <Show when={activeTab() === "notifications"}>
            <div class="space-y-4">
              <Show when={notifications().length === 0}>
                <div class="text-center py-12">
                  <div class="text-6xl mb-4">🔔</div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">
                    No notifications yet
                  </h3>
                  <p class="text-gray-600 mb-6">
                    Notifications will appear here when alerts are triggered
                  </p>
                  <button
                    onClick={() => setShowTestModal(true)}
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Send Test Notification
                  </button>
                </div>
              </Show>

              <Show when={notifications().length > 0}>
                <div class="space-y-3">
                  <For each={notifications()}>
                    {notification => (
                      <NotificationCard
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </Show>

          {/* Push Subscriptions Tab */}
          <Show when={activeTab() === "subscriptions"}>
            <div class="space-y-4">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-blue-800">
                      Push Notifications
                    </h3>
                    <div class="mt-2 text-sm text-blue-700">
                      <p>
                        Push notifications allow you to receive alerts even when
                        the app is not open. Your browser will ask for
                        permission to send notifications when you first visit
                        the site.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Show when={pushSubscriptions().length === 0}>
                <div class="text-center py-12">
                  <div class="text-6xl mb-4">📱</div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">
                    No push subscriptions
                  </h3>
                  <p class="text-gray-600 mb-6">
                    Enable push notifications to receive alerts on your device
                  </p>
                  <button
                    onClick={() => {
                      // TODO: Implement request notification permission
                      logger.info("Requesting notification permission");
                    }}
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Enable Push Notifications
                  </button>
                </div>
              </Show>

              <Show when={pushSubscriptions().length > 0}>
                <div class="space-y-3">
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
            </div>
          </Show>
        </Show>
      </div>

      {/* Modals */}
      <Show when={showTestModal()}>
        <TestNotificationModal
          onClose={() => setShowTestModal(false)}
          onSubmit={handleTestNotification}
        />
      </Show>
    </div>
  );
};

const Notifications: VoidComponent = () => {
  return <NotificationsContent />;
};

export default Notifications;
