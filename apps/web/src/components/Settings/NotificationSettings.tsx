import { type Component, createSignal, createEffect, Show } from "solid-js";
import { logger } from "~/lib/logger";

export interface NotificationSettingsData {
  enableNotifications: boolean;
  enablePushNotifications: boolean;
}

interface NotificationSettingsProps {
  settings: NotificationSettingsData;
  onChange: (settings: NotificationSettingsData) => void | Promise<void>;
}

export const NotificationSettings: Component<
  NotificationSettingsProps
> = props => {
  const [enableNotifications, setEnableNotifications] = createSignal(false);
  const [enablePushNotifications, setEnablePushNotifications] =
    createSignal(false);

  // Initialize signals when props change
  createEffect(() => {
    setEnableNotifications(props.settings.enableNotifications);
    setEnablePushNotifications(props.settings.enablePushNotifications);
  });

  const handleSave = () => {
    props.onChange({
      enableNotifications: enableNotifications(),
      enablePushNotifications: enablePushNotifications(),
    });
  };

  const handleRequestPermission = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setEnablePushNotifications(true);
          handleSave();
        } else {
          alert(
            "Notification permission denied. Please enable it in your browser settings."
          );
        }
      } else {
        alert("This browser does not support notifications.");
      }
    } catch (err) {
      logger.error("Error requesting notification permission", { error: err });
      alert("Failed to request notification permission.");
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center">
        <input
          id="enable-notifications"
          type="checkbox"
          checked={enableNotifications()}
          onChange={e => setEnableNotifications(e.currentTarget.checked)}
          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
        />
        <label
          for="enable-notifications"
          class="ml-2 block text-sm text-gray-900 dark:text-white"
        >
          Enable in-app notifications
        </label>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Show notification alerts within the application
      </p>

      <div class="flex items-center">
        <input
          id="enable-push-notifications"
          type="checkbox"
          checked={enablePushNotifications()}
          onChange={e => setEnablePushNotifications(e.currentTarget.checked)}
          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
        />
        <label
          for="enable-push-notifications"
          class="ml-2 block text-sm text-gray-900 dark:text-white"
        >
          Enable push notifications
        </label>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Receive notifications even when the app is not open
      </p>

      <Show when={!enablePushNotifications()}>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Push notifications not enabled
              </h3>
              <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  To receive push notifications, you need to grant permission in
                  your browser.
                </p>
              </div>
              <div class="mt-3">
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors"
                >
                  Grant Permission
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>

      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleSave}
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Save Notification Settings
        </button>
      </div>
    </div>
  );
};
