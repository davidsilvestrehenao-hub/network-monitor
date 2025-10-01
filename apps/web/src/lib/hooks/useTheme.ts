import { createSignal, createEffect, onMount } from "solid-js";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = createSignal<Theme>(
    (typeof window !== "undefined" &&
      (localStorage.getItem("theme") as Theme)) ||
      "system"
  );

  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const getEffectiveTheme = (): "light" | "dark" => {
    const currentTheme = theme();
    return currentTheme === "system" ? getSystemTheme() : currentTheme;
  };

  const applyTheme = (effectiveTheme: "light" | "dark") => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    if (effectiveTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  // Apply theme on mount
  onMount(() => {
    applyTheme(getEffectiveTheme());
  });

  // Watch for theme changes
  createEffect(() => {
    applyTheme(getEffectiveTheme());
  });

  // Listen for system theme changes
  createEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme() === "system") {
        applyTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    // Justification: Cleanup function uses reactive theme() in event handler - false positive
    // eslint-disable-next-line solid/reactivity
    return () => mediaQuery.removeEventListener("change", handleChange);
  });

  return {
    theme,
    setTheme: updateTheme,
    effectiveTheme: getEffectiveTheme,
  };
}
