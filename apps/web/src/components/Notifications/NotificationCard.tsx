import { type Component, createSignal, Show } from "solid-js";
import type { Notification } from "@network-monitor/shared";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void | Promise<void>;
  onViewDetails?: (id: number) => void;
}

export const NotificationCard: Component<NotificationCardProps> = props => {
  const [isMarking, setIsMarking] = createSignal(false);

  const formatTime = (date: string | Date): string => {
    const now = new Date();
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const diffInMinutes = (now.getTime() - dateObj.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return dateObj.toLocaleDateString();
    }
  };

  const getTypeIcon = (): string => {
    // Notification type is just string in the schema
    const message = props.notification.message.toLowerCase();
    if (message.includes("success") || message.includes("resolved"))
      return "✅";
    if (message.includes("warning") || message.includes("alert")) return "⚠️";
    if (message.includes("error") || message.includes("failed")) return "❌";
    return "🔔";
  };

  const getTypeColor = (): string => {
    const message = props.notification.message.toLowerCase();
    if (message.includes("success") || message.includes("resolved"))
      return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20";
    if (message.includes("warning") || message.includes("alert"))
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20";
    if (message.includes("error") || message.includes("failed"))
      return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20";
    return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20";
  };

  const handleMarkAsRead = async () => {
    if (props.notification.read) return;

    setIsMarking(true);
    try {
      await props.onMarkAsRead(props.notification.id);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div
      class={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 ${
        props.notification.read
          ? "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
          : "border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-800"
      }`}
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-3 flex-1 min-w-0">
          <div class={`p-2 rounded-full flex-shrink-0 ${getTypeColor()}`}>
            <span class="text-lg">{getTypeIcon()}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-2">
              <h4
                class={`text-lg font-medium ${
                  props.notification.read
                    ? "text-gray-600 dark:text-gray-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {props.notification.message}
              </h4>
              <Show when={!props.notification.read}>
                <span class="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 rounded-full flex-shrink-0">
                  New
                </span>
              </Show>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {formatTime(props.notification.sentAt)}
            </div>
          </div>
        </div>

        <div class="flex space-x-2 ml-4">
          <Show when={!props.notification.read}>
            <button
              type="button"
              onClick={handleMarkAsRead}
              disabled={isMarking()}
              class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
            >
              {isMarking() ? "..." : "Mark Read"}
            </button>
          </Show>
          <Show when={props.onViewDetails}>
            <button
              type="button"
              onClick={() => props.onViewDetails?.(props.notification.id)}
              class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              View Details
            </button>
          </Show>
        </div>
      </div>
    </div>
  );
};
