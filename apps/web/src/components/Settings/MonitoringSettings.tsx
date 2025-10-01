import { type Component, createSignal, createEffect, For } from "solid-js";

export interface MonitoringSettingsData {
  monitoringInterval: number;
  dataRetentionDays: number;
  autoCleanup: boolean;
}

interface MonitoringSettingsProps {
  settings: MonitoringSettingsData;
  onChange: (settings: MonitoringSettingsData) => void | Promise<void>;
}

export const MonitoringSettings: Component<MonitoringSettingsProps> = props => {
  const [monitoringInterval, setMonitoringInterval] = createSignal(30);
  const [dataRetentionDays, setDataRetentionDays] = createSignal(30);
  const [autoCleanup, setAutoCleanup] = createSignal(false);

  // Initialize from props
  createEffect(() => {
    setMonitoringInterval(props.settings.monitoringInterval);
    setDataRetentionDays(props.settings.dataRetentionDays);
    setAutoCleanup(props.settings.autoCleanup);
  });

  const handleSave = () => {
    props.onChange({
      monitoringInterval: monitoringInterval(),
      dataRetentionDays: dataRetentionDays(),
      autoCleanup: autoCleanup(),
    });
  };

  const intervalOptions = [
    { value: 10, label: "10 seconds" },
    { value: 30, label: "30 seconds" },
    { value: 60, label: "1 minute" },
    { value: 300, label: "5 minutes" },
    { value: 600, label: "10 minutes" },
    { value: 1800, label: "30 minutes" },
  ];

  return (
    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Monitoring Interval
        </label>
        <select
          value={monitoringInterval()}
          onChange={e => setMonitoringInterval(parseInt(e.currentTarget.value))}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          <For each={intervalOptions}>
            {option => <option value={option.value}>{option.label}</option>}
          </For>
        </select>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          How often to run speed tests for each target
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Data Retention (Days)
        </label>
        <input
          type="number"
          min="1"
          max="365"
          value={dataRetentionDays()}
          onInput={e => setDataRetentionDays(parseInt(e.currentTarget.value))}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          How long to keep speed test results (1-365 days)
        </p>
      </div>

      <div class="flex items-center">
        <input
          id="auto-cleanup"
          type="checkbox"
          checked={autoCleanup()}
          onChange={e => setAutoCleanup(e.currentTarget.checked)}
          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
        />
        <label
          for="auto-cleanup"
          class="ml-2 block text-sm text-gray-900 dark:text-white"
        >
          Enable automatic data cleanup
        </label>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Automatically delete old data based on retention settings
      </p>

      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleSave}
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Save Monitoring Settings
        </button>
      </div>
    </div>
  );
};
