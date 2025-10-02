import { createSignal } from "solid-js";
import { logger } from "~/lib/logger";
import {
  AppLayout,
  SettingsSection,
  MonitoringSettings,
  NotificationSettings,
  DataSettings,
  AboutSection,
  ThemeToggle,
  type MonitoringSettingsData,
  type NotificationSettingsData,
} from "~/components";

export default function SettingsPage() {
  // Mock settings - in real app, fetch from API
  const [monitoringSettings] = createSignal<MonitoringSettingsData>({
    monitoringInterval: 30,
    dataRetentionDays: 30,
    autoCleanup: true,
  });

  const [notificationSettings] = createSignal<NotificationSettingsData>({
    enableNotifications: true,
    enablePushNotifications: false,
  });

  const handleMonitoringChange = async (settings: MonitoringSettingsData) => {
    try {
      logger.info("Monitoring settings updated", { settings });
      // TODO: Save to API via tRPC
      // await trpc.settings.updateMonitoring.mutate(settings);
      alert("Monitoring settings saved successfully!");
    } catch (error) {
      logger.error("Failed to save monitoring settings", { error });
      alert("Failed to save settings. See console for details.");
    }
  };

  const handleNotificationChange = async (
    settings: NotificationSettingsData
  ) => {
    try {
      logger.info("Notification settings updated", { settings });
      // TODO: Save to API via tRPC
      // await trpc.settings.updateNotifications.mutate(settings);
      alert("Notification settings saved successfully!");
    } catch (error) {
      logger.error("Failed to save notification settings", { error });
      alert("Failed to save settings. See console for details.");
    }
  };

  const handleExportData = async () => {
    try {
      logger.info("Exporting data");
      // TODO: Implement data export via tRPC
      // const data = await trpc.data.export.query();
      // Download JSON file
      alert("Data export functionality coming soon!");
    } catch (error) {
      logger.error("Failed to export data", { error });
      alert("Failed to export data. See console for details.");
    }
  };

  const handleImportData = async (file: File) => {
    try {
      logger.info("Importing data", { filename: file.name });
      // TODO: Implement data import via tRPC
      const text = await file.text();
      const data = JSON.parse(text);
      logger.info("Data parsed", { data });
      // await trpc.data.import.mutate({ data });
      alert("Data import functionality coming soon!");
    } catch (error) {
      logger.error("Failed to import data", { error });
      alert("Failed to import data. See console for details.");
    }
  };

  const handleDeleteAllData = async () => {
    try {
      logger.info("Deleting all data");
      // TODO: Implement delete all via tRPC
      // await trpc.data.deleteAll.mutate();
      alert("Delete all data functionality coming soon!");
    } catch (error) {
      logger.error("Failed to delete all data", { error });
      alert("Failed to delete data. See console for details.");
    }
  };

  return (
    <AppLayout>
      <div>
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Configure application preferences and manage your data
          </p>
        </div>

        <div class="space-y-6">
          {/* Theme Settings */}
          <SettingsSection title="Appearance" icon="🎨">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <ThemeToggle />
              </div>
            </div>
          </SettingsSection>

          {/* Monitoring Settings */}
          <SettingsSection title="Monitoring" icon="🎯">
            <MonitoringSettings
              settings={monitoringSettings()}
              onChange={handleMonitoringChange}
            />
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection title="Notifications" icon="🔔">
            <NotificationSettings
              settings={notificationSettings()}
              onChange={handleNotificationChange}
            />
          </SettingsSection>

          {/* Data Management */}
          <SettingsSection title="Data Management" icon="💾">
            <DataSettings
              settings={{
                dataRetentionDays: monitoringSettings().dataRetentionDays,
                autoCleanup: monitoringSettings().autoCleanup,
              }}
              onExport={handleExportData}
              onImport={handleImportData}
              onDeleteAll={handleDeleteAllData}
            />
          </SettingsSection>

          {/* About */}
          <SettingsSection title="About" icon="ℹ️">
            <AboutSection />
          </SettingsSection>
        </div>
      </div>
    </AppLayout>
  );
}
