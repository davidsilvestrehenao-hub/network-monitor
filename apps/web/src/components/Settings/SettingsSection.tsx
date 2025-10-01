import { type Component, type JSX } from "solid-js";

interface SettingsSectionProps {
  title: string;
  icon: string;
  children: JSX.Element;
}

export const SettingsSection: Component<SettingsSectionProps> = props => {
  return (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center space-x-3 mb-4">
        <span class="text-2xl">{props.icon}</span>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {props.title}
        </h3>
      </div>
      <div class="space-y-4">{props.children}</div>
    </div>
  );
};
