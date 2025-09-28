import { createSignal } from "solid-js";

interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: string;
}

interface PushSubscriptionCardProps {
  subscription: PushSubscription;
  onDelete: (id: string) => void;
}

export function PushSubscriptionCard(props: PushSubscriptionCardProps) {
  const [isDeleting, setIsDeleting] = createSignal(false);

  const getStatusColor = (): string => {
    return "text-green-600 bg-green-100";
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
    setIsDeleting(true);
    try {
      await props.onDelete(props.subscription.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-3">
          <div class="p-2 rounded-full bg-blue-100">
            <span class="text-lg">📱</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <h4 class="text-lg font-medium text-gray-900">
                Push Subscription
              </h4>
              <span
                class={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}
              >
                {getStatusText()}
              </span>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
              <div>
                <span class="font-medium">Browser:</span>{" "}
                {getBrowserName(props.subscription.endpoint)}
              </div>
              <div>
                <span class="font-medium">User ID:</span>{" "}
                {props.subscription.userId}
              </div>
              <div>
                <span class="font-medium">Endpoint:</span>
                <span class="ml-1 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {props.subscription.endpoint.slice(0, 50)}...
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex space-x-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting()}
            class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            {isDeleting() ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
