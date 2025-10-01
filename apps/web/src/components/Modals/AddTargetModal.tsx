import { type Component, createSignal, Show } from "solid-js";
import type { CreateTargetData } from "@network-monitor/shared";

interface AddTargetModalProps {
  onClose: () => void;
  onSubmit: (data: CreateTargetData) => void | Promise<void>;
}

export const AddTargetModal: Component<AddTargetModalProps> = props => {
  const [name, setName] = createSignal("");
  const [address, setAddress] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!name().trim()) {
      setError("Target name is required");
      return;
    }

    if (!address().trim()) {
      setError("Target address is required");
      return;
    }

    // Basic URL validation
    try {
      new URL(address());
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await props.onSubmit({
        name: name().trim(),
        address: address().trim(),
        ownerId: "mock-user-id", // TODO: Get from auth context
      });
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create target");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading()) {
      setName("");
      setAddress("");
      setError(null);
      props.onClose();
    }
  };

  return (
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Target
              </h3>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading()}
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
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
                  for="target-name"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Target Name *
                </label>
                <input
                  id="target-name"
                  type="text"
                  value={name()}
                  onInput={e => setName(e.currentTarget.value)}
                  placeholder="e.g., Google DNS"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  disabled={loading()}
                  required
                />
              </div>

              <div>
                <label
                  for="target-address"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Target Address *
                </label>
                <input
                  id="target-address"
                  type="url"
                  value={address()}
                  onInput={e => setAddress(e.currentTarget.value)}
                  placeholder="e.g., https://8.8.8.8"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  disabled={loading()}
                  required
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter a valid URL or IP address to monitor
                </p>
              </div>

              <Show when={error()}>
                <div class="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded text-sm">
                  {error()}
                </div>
              </Show>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading()}
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading() || !name().trim() || !address().trim()}
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading() ? "Creating..." : "Create Target"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
