interface StatusCardProps {
  title: string;
  value: string;
  icon: string;
  color: "blue" | "green" | "red" | "yellow" | "purple" | "gray";
  subtitle?: string;
}

const colorClasses = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  red: "bg-red-100 text-red-600",
  yellow: "bg-yellow-100 text-yellow-600",
  purple: "bg-purple-100 text-purple-600",
  gray: "bg-gray-100 text-gray-600",
};

export function StatusCard(props: StatusCardProps) {
  return (
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class={`p-3 rounded-full ${colorClasses[props.color]}`}>
          <span class="text-2xl">{props.icon}</span>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">{props.title}</p>
          <p class="text-2xl font-bold text-gray-900">{props.value}</p>
          {props.subtitle && (
            <p class="text-xs text-gray-500">{props.subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
