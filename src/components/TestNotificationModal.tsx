import { createSignal } from "solid-js";
import {
  TestNotificationFormData,
  FormSubmitHandler,
} from "~/lib/types/component-types";

interface TestNotificationModalProps {
  onClose: () => void;
  onSubmit: FormSubmitHandler<TestNotificationFormData>;
}

export function TestNotificationModal(props: TestNotificationModalProps) {
  const [message, setMessage] = createSignal("");
  const [type, setType] = createSignal<
    "info" | "warning" | "error" | "success"
  >("info");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!message().trim()) {
      setError("Message is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await props.onSubmit({
        message: message().trim(),
        type: type(),
        title: "Test Notification",
        userId: "mock-user", // Mock user ID for testing
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send test notification"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading()) {
      setMessage("");
      setType("info");
      setError(null);
      props.onClose();
    }
  };

  const getTypeDescription = (type: string): string => {
    switch (type) {
      case "success":
        return "Success notification (green)";
      case "warning":
        return "Warning notification (yellow)";
      case "error":
        return "Error notification (red)";
      case "info":
        return "Info notification (blue)";
      default:
        return "";
    }
  };

  return (
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">
                Send Test Notification
              </h3>
              <button
                onClick={handleClose}
                disabled={loading()}
                class="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} class="px-6 py-4">
            <div class="space-y-4">
              <div>
                <label
                  for="notification-message"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message *
                </label>
                <textarea
                  id="notification-message"
                  value={message()}
                  onInput={e => setMessage(e.currentTarget.value)}
                  placeholder="Enter your test message..."
                  rows={3}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading()}
                  required
                />
              </div>

              <div>
                <label
                  for="notification-type"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Type *
                </label>
                <select
                  id="notification-type"
                  value={type()}
                  onChange={e =>
                    setType(
                      e.currentTarget.value as
                        | "info"
                        | "warning"
                        | "error"
                        | "success"
                    )
                  }
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading()}
                  required
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
                <p class="mt-1 text-xs text-gray-500">
                  {getTypeDescription(type())}
                </p>
              </div>

              {error() && (
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {error()}
                </div>
              )}
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading()}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading() || !message().trim()}
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading() ? "Sending..." : "Send Test"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
