import { type Component, createSignal, Show } from "solid-js";

export interface TargetFormData {
  name: string;
  address: string;
}

interface TargetFormProps {
  initialData?: TargetFormData;
  onSubmit: (data: TargetFormData) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export const TargetForm: Component<TargetFormProps> = props => {
  const [name, setName] = createSignal(props.initialData?.name || "");
  const [address, setAddress] = createSignal(props.initialData?.address || "");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    if (!name().trim() || !address().trim()) {
      setError("Both name and address are required");
      return;
    }

    try {
      setIsSubmitting(true);
      await props.onSubmit({
        name: name().trim(),
        address: address().trim(),
      });
      // Reset form on success
      setName("");
      setAddress("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save target");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <Show when={error()}>
        <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-sm text-red-600 dark:text-red-400">{error()}</p>
        </div>
      </Show>

      <div>
        <label
          for="target-name"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Name
        </label>
        <input
          id="target-name"
          type="text"
          value={name()}
          onInput={e => setName(e.currentTarget.value)}
          placeholder="e.g., Google DNS"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label
          for="target-address"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Address (URL)
        </label>
        <input
          id="target-address"
          type="url"
          value={address()}
          onInput={e => setAddress(e.currentTarget.value)}
          placeholder="https://8.8.8.8"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div class="flex items-center space-x-3">
        <button
          type="submit"
          disabled={isSubmitting()}
          class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting() ? "Saving..." : props.submitLabel || "Add Target"}
        </button>

        <Show when={props.onCancel}>
          <button
            type="button"
            onClick={() => props.onCancel?.()}
            class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </Show>
      </div>
    </form>
  );
};
