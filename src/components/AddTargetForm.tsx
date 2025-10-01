import { createSignal } from "solid-js";
import { useCommandQuery, useEventBus } from "~/lib/frontend/container";
import type { FrontendEvents } from "@network-monitor/shared";

export function AddTargetForm() {
  const commandQuery = useCommandQuery();
  const eventBus = useEventBus();
  const [name, setName] = createSignal("");
  const [address, setAddress] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!name() || !address()) {
      setError("Name and address are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await commandQuery.createTarget({
        name: name(),
        address: address(),
        ownerId: "mock-user-id", // In real app, get from auth context
      });

      // Reset form
      setName("");
      setAddress("");

      // Show success notification
      eventBus.emitTyped<FrontendEvents["SHOW_NOTIFICATION"]>(
        "SHOW_NOTIFICATION",
        {
          message: "Target created successfully!",
          type: "success",
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Target</h3>

      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label
            for="target-name"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Target Name
          </label>
          <input
            id="target-name"
            type="text"
            value={name()}
            onInput={e => setName(e.currentTarget.value)}
            placeholder="e.g., Google DNS"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading()}
          />
        </div>

        <div>
          <label
            for="target-address"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Target Address
          </label>
          <input
            id="target-address"
            type="url"
            value={address()}
            onInput={e => setAddress(e.currentTarget.value)}
            placeholder="e.g., https://8.8.8.8"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading()}
          />
        </div>

        {error() && (
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {error()}
          </div>
        )}

        <button
          type="submit"
          disabled={loading() || !name() || !address()}
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading() ? "Creating..." : "Add Target"}
        </button>
      </form>
    </div>
  );
}
