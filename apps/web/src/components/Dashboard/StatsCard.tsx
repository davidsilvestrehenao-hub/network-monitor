import { type Component, type JSX } from "solid-js";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: JSX.Element;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export const StatsCard: Component<StatsCardProps> = props => {
  return (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {props.title}
          </p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">
            {props.value}
          </p>

          {props.trend && (
            <div
              class={`flex items-center mt-2 text-sm ${props.trend.isPositive ? "text-green-600" : "text-red-600"}`}
            >
              <svg
                class="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d={
                    props.trend.isPositive
                      ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  }
                />
              </svg>
              <span>{Math.abs(props.trend.value)}%</span>
            </div>
          )}

          {props.subtitle && (
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {props.subtitle}
            </p>
          )}
        </div>

        <div class="ml-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          {props.icon}
        </div>
      </div>
    </div>
  );
};
