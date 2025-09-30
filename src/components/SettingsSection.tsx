import type { ParentProps } from "solid-js";

interface SettingsSectionProps extends ParentProps {
  title: string;
  icon: string;
}

export function SettingsSection(props: SettingsSectionProps) {
  return (
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center space-x-3 mb-4">
        <span class="text-2xl">{props.icon}</span>
        <h3 class="text-lg font-semibold text-gray-900">{props.title}</h3>
      </div>
      <div class="space-y-4">{props.children}</div>
    </div>
  );
}
