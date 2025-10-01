import { type Component, Show } from "solid-js";
import { StatusIndicator, type TargetStatus } from "./StatusIndicator";

export interface Target {
  id: string;
  name: string;
  address: string;
  status?: TargetStatus;
  lastCheck?: Date;
  ping?: number;
  uptime?: number;
}

interface TargetCardProps {
  target: Target;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleMonitoring?: (id: string) => void;
}

export const TargetCard: Component<TargetCardProps> = props => {
  const formatDate = (date?: Date) => {
    if (!date) return "Never";
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  return (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {props.target.name}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {props.target.address}
          </p>
          <StatusIndicator
            status={props.target.status || "unknown"}
            label={props.target.status || "Unknown"}
          />
        </div>

        <div class="flex items-center space-x-2">
          <Show when={props.onEdit}>
            <button
              type="button"
              onClick={() => props.onEdit?.(props.target.id)}
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Edit"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </Show>

          <Show when={props.onDelete}>
            <button
              type="button"
              onClick={() => props.onDelete?.(props.target.id)}
              class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Delete"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </Show>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Ping</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            <Show when={props.target.ping !== undefined} fallback="--">
              {props.target.ping}ms
            </Show>
          </p>
        </div>

        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Uptime</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            <Show when={props.target.uptime !== undefined} fallback="--">
              {props.target.uptime?.toFixed(1)}%
            </Show>
          </p>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Last check: {formatDate(props.target.lastCheck)}</span>

        <Show when={props.onToggleMonitoring}>
          <button
            type="button"
            onClick={() => props.onToggleMonitoring?.(props.target.id)}
            class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            Start Monitoring
          </button>
        </Show>
      </div>
    </div>
  );
};
