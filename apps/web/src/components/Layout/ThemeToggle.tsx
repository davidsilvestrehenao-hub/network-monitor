import { type Component, createSignal, Show, For } from "solid-js";
import { useTheme, type Theme } from "~/lib/hooks/useTheme";

export const ThemeToggle: Component = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = createSignal(false);

  const themes: Array<{ value: Theme; label: string; icon: string }> = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "system", label: "System", icon: "💻" },
  ];

  const getCurrentTheme = () => {
    return themes.find(t => t.value === theme()) || themes[2];
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div class="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen())}
        class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={`Theme: ${getCurrentTheme().label}`}
      >
        <span class="text-xl">{getCurrentTheme().icon}</span>
      </button>

      <Show when={isOpen()}>
        <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <For each={themes}>
            {themeOption => (
              <button
                type="button"
                onClick={() => handleThemeChange(themeOption.value)}
                class={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors ${
                  themeOption.value === theme()
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <span class="text-lg">{themeOption.icon}</span>
                <span>{themeOption.label}</span>
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
