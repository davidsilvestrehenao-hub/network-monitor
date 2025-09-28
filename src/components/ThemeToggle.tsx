import { createSignal, Show, For } from "solid-js";

interface ThemeToggleProps {
  value: "light" | "dark" | "system";
  onChange: (theme: "light" | "dark" | "system") => void;
}

export function ThemeToggle(props: ThemeToggleProps) {
  const [isOpen, setIsOpen] = createSignal(false);

  const themes = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "system", label: "System", icon: "💻" },
  ];

  const getCurrentTheme = () => {
    return themes.find(theme => theme.value === props.value) || themes[2];
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    props.onChange(theme);
    setIsOpen(false);
  };

  return (
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Theme
        </label>
        <div class="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen())}
            class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus: outline-none focus:ring-1 focus:ring-blue-500,
  focus:border-blue-500,
  sm:text-sm"
          >
            <span class="flex items-center">
              <span class="text-lg mr-3">{getCurrentTheme().icon}</span>
              <span class="block truncate">{getCurrentTheme().label}</span>
            </span>
            <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                class="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </button>

          <Show when={isOpen()}>
            <div class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              <For each={themes}>
                {(theme: { value: string; label: string; icon: string }) => (
                  <button
                    onClick={() =>
                      handleThemeChange(
                        theme.value as "light" | "dark" | "system"
                      )
                    }
                    class={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      theme.value === props.value
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-900"
                    }`}
                  >
                    <span class="text-lg mr-3">{theme.icon}</span>
                    {theme.label}
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Choose your preferred color scheme
        </p>
      </div>
    </div>
  );
}
