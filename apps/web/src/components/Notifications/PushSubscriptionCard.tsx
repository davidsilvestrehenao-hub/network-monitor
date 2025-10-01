import { type Component, createSignal } from "solid-js";
import type { PushSubscription } from "@network-monitor/shared";

interface PushSubscriptionCardProps {
  subscription: PushSubscription;
  onDelete: (id: string) => void | Promise<void>;
}

export const PushSubscriptionCard: Component<
  PushSubscriptionCardProps
> = props => {
  const [isDeleting, setIsDeleting] = createSignal(false);

  const getStatusColor = (): string => {
    return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20";
  };

  const getStatusText = (): string => {
    return "Active";
  };

  const getBrowserName = (endpoint: string): string => {
    if (endpoint.includes("fcm.googleapis.com")) return "Chrome/Firefox";
    if (endpoint.includes("wns2-")) return "Edge";
    if (endpoint.includes("safari")) return "Safari";
    return "Unknown";
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this push subscription? You will no longer receive notifications on this device."
      )
    )
      return;

    setIsDeleting(true);
    try {
      await props.onDelete(props.subscription.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-3 flex-1 min-w-0">
          <div class="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 flex-shrink-0">
            <span class="text-lg">📱</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-2">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white">
                Push Subscription
              </h4>
              <span
                class={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor()}`}
              >
                {getStatusText()}
              </span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>
                <span class="font-medium">Browser:</span>{" "}
                {getBrowserName(props.subscription.endpoint)}
              </div>
              <div>
                <span class="font-medium">User ID:</span>{" "}
                {props.subscription.userId}
              </div>
              <div class="flex items-start">
                <span class="font-medium flex-shrink-0">Endpoint:</span>
                <span class="ml-1 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all">
                  {props.subscription.endpoint.slice(0, 50)}...
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex space-x-2 ml-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting()}
            class="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
          >
            {isDeleting() ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
