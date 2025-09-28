import { createSignal, Show } from "solid-js";

interface Notification {
  id: number;
  message: string;
  sentAt: string | Date;
  read: boolean;
  type?: "info" | "warning" | "error" | "success";
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

export function NotificationCard(props: NotificationCardProps) {
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

  const getTypeIcon = (type?: string): string => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  const getTypeColor = (type?: string): string => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "info":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
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
      class={`bg-white rounded-lg shadow p-6 border-l-4 ${
        props.notification.read
          ? "border-gray-300 bg-gray-50"
          : "border-blue-500 bg-white"
      }`}
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-3">
          <div
            class={`p-2 rounded-full ${getTypeColor(props.notification.type)}`}
          >
            <span class="text-lg">{getTypeIcon(props.notification.type)}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <h4
                class={`text-lg font-medium ${
                  props.notification.read ? "text-gray-600" : "text-gray-900"
                }`}
              >
                {props.notification.message}
              </h4>
              <Show when={!props.notification.read}>
                <span class="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                  New
                </span>
              </Show>
            </div>
            <div class="text-sm text-gray-500">
              {formatTime(props.notification.sentAt)}
            </div>
          </div>
        </div>

        <div class="flex space-x-2">
          <Show when={!props.notification.read}>
            <button
              onClick={handleMarkAsRead}
              disabled={isMarking()}
              class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {isMarking() ? "..." : "Mark Read"}
            </button>
          </Show>
          <button class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
