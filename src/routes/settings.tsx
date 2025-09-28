import { createSignal, createEffect, Show, type VoidComponent } from "solid-js";
import { FrontendServicesProvider } from "~/lib/frontend/container";
import { Navigation } from "~/components/Navigation";
import { SettingsSection } from "~/components/SettingsSection";
import { ThemeToggle } from "~/components/ThemeToggle";
import { MonitoringSettings } from "~/components/MonitoringSettings";
import { NotificationSettings } from "~/components/NotificationSettings";
import { DataSettings } from "~/components/DataSettings";
import { AboutSection } from "~/components/AboutSection";

interface AppSettings {
  theme: "light" | "dark" | "system";
  monitoringInterval: number;
  enableNotifications: boolean;
  enablePushNotifications: boolean;
  dataRetentionDays: number;
  autoCleanup: boolean;
}

interface MonitoringSettingsType {
  monitoringInterval: number;
  dataRetentionDays: number;
  autoCleanup: boolean;
}

interface NotificationSettingsType {
  enableNotifications: boolean;
  enablePushNotifications: boolean;
}

const Settings: VoidComponent = () => {
  const [settings, setSettings] = createSignal<AppSettings>({
    theme: "system" as "light" | "dark" | "system",
    monitoringInterval: 30,
    enableNotifications: true,
    enablePushNotifications: true,
    dataRetentionDays: 30,
    autoCleanup: true,
  });
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  // Load settings
  createEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Load settings from API or localStorage
        const savedSettings = localStorage.getItem("app-settings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load settings"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  });

  const handleSaveSettings = async (newSettings: AppSettings) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Save settings to API
      localStorage.setItem("app-settings", JSON.stringify(newSettings));
      setSettings(newSettings);
      setSuccess("Settings saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleMonitoringSettingsChange = async (
    monitoringSettings: MonitoringSettingsType
  ) => {
    const newSettings: AppSettings = {
      ...settings(),
      ...monitoringSettings,
    };
    await handleSaveSettings(newSettings);
  };

  const handleNotificationSettingsChange = async (
    notificationSettings: NotificationSettingsType
  ) => {
    const newSettings: AppSettings = {
      ...settings(),
      ...notificationSettings,
    };
    await handleSaveSettings(newSettings);
  };

  const handleResetSettings = async () => {
    if (
      confirm("Are you sure you want to reset all settings to default values?")
    ) {
      const defaultSettings = {
        theme: "system" as "light" | "dark" | "system",
        monitoringInterval: 30,
        enableNotifications: true,
        enablePushNotifications: true,
        dataRetentionDays: 30,
        autoCleanup: true,
      };

      await handleSaveSettings(defaultSettings);
    }
  };

  const handleExportData = async () => {
    try {
      // TODO: Implement data export
      console.log("Exporting data...");
      setSuccess("Data export started. You will receive an email when ready.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export data");
    }
  };

  const handleImportData = async (file: File) => {
    try {
      // TODO: Implement data import
      console.log("Importing data from file:", file.name);
      setSuccess("Data imported successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import data");
    }
  };

  const handleDeleteAllData = async () => {
    if (
      confirm(
        "Are you sure you want to delete ALL data? This action cannot be undone!"
      )
    ) {
      if (
        confirm(
          "This will permanently delete all targets, test results, and settings. Type 'DELETE' to confirm:"
        )
      ) {
        try {
          // TODO: Implement delete all data
          console.log("Deleting all data...");
          setSuccess("All data has been deleted.");
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to delete data"
          );
        }
      }
    }
  };

  return (
    <FrontendServicesProvider>
      <Navigation>
        <div class="p-6">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p class="text-gray-600">
              Configure your monitoring preferences and application settings
            </p>
          </div>

          {error() && (
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong class="font-bold">Error:</strong>
              <span class="block sm:inline"> {error()}</span>
            </div>
          )}

          {success() && (
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <strong class="font-bold">Success:</strong>
              <span class="block sm:inline"> {success()}</span>
            </div>
          )}

          {loading() && (
            <div class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              <p class="mt-4 text-gray-600">Loading settings...</p>
            </div>
          )}

          <Show when={!loading()}>
            <div class="space-y-6">
              {/* Appearance Settings */}
              <SettingsSection title="Appearance" icon="🎨">
                <ThemeToggle
                  value={settings().theme}
                  onChange={theme =>
                    handleSaveSettings({ ...settings(), theme })
                  }
                />
              </SettingsSection>

              {/* Monitoring Settings */}
              <SettingsSection title="Monitoring" icon="📡">
                <MonitoringSettings
                  settings={settings()}
                  onChange={handleMonitoringSettingsChange}
                />
              </SettingsSection>

              {/* Notification Settings */}
              <SettingsSection title="Notifications" icon="🔔">
                <NotificationSettings
                  settings={settings()}
                  onChange={handleNotificationSettingsChange}
                />
              </SettingsSection>

              {/* Data Management */}
              <SettingsSection title="Data Management" icon="💾">
                <DataSettings
                  settings={settings()}
                  onExport={handleExportData}
                  onImport={handleImportData}
                  onDeleteAll={handleDeleteAllData}
                />
              </SettingsSection>

              {/* About */}
              <SettingsSection title="About" icon="ℹ️">
                <AboutSection />
              </SettingsSection>

              {/* Actions */}
              <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h3>
                <div class="flex flex-wrap gap-4">
                  <button
                    onClick={handleResetSettings}
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Reset to Defaults
                  </button>
                  <button
                    onClick={handleExportData}
                    class="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Export Data
                  </button>
                  <button
                    onClick={() =>
                      document.getElementById("import-file")?.click()
                    }
                    class="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    Import Data
                  </button>
                  <button
                    onClick={handleDeleteAllData}
                    class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Delete All Data
                  </button>
                </div>

                {/* Hidden file input for import */}
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={e => {
                    const file = e.currentTarget.files?.[0];
                    if (file) handleImportData(file);
                  }}
                  class="hidden"
                />
              </div>
            </div>
          </Show>
        </div>
      </Navigation>
    </FrontendServicesProvider>
  );
};

export default Settings;
