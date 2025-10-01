import { type Component, createSignal } from "solid-js";

interface DataSettingsProps {
  settings: {
    dataRetentionDays: number;
    autoCleanup: boolean;
  };
  onExport: () => void | Promise<void>;
  onImport: (file: File) => void | Promise<void>;
  onDeleteAll: () => void | Promise<void>;
}

export const DataSettings: Component<DataSettingsProps> = props => {
  const [isExporting, setIsExporting] = createSignal(false);
  const [isImporting, setIsImporting] = createSignal(false);
  const [isDeleting, setIsDeleting] = createSignal(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await props.onExport();
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      await props.onImport(file);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL data? This action cannot be undone!"
      )
    )
      return;

    setIsDeleting(true);
    try {
      await props.onDeleteAll();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileSelect = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  return (
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data Retention
          </label>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {props.settings.dataRetentionDays} days
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Data older than this will be automatically deleted
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Auto Cleanup
          </label>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {props.settings.autoCleanup ? "Enabled" : "Disabled"}
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Automatically clean up old data
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Data Management
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting()}
            class="flex items-center justify-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
          >
            <svg
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {isExporting() ? "Exporting..." : "Export Data"}
          </button>

          <label class="flex items-center justify-center px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors cursor-pointer">
            <svg
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {isImporting() ? "Importing..." : "Import Data"}
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              class="hidden"
            />
          </label>
        </div>

        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={isDeleting()}
            class="flex items-center justify-center w-full px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
          >
            <svg
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {isDeleting() ? "Deleting..." : "Delete All Data"}
          </button>
          <p class="mt-2 text-xs text-red-600 dark:text-red-400 text-center">
            This action cannot be undone
          </p>
        </div>
      </div>
    </div>
  );
};
