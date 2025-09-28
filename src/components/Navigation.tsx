import { createSignal, Show, For, createEffect } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { ComponentChildren } from "~/lib/types/component-types";

interface NavigationProps {
  children: ComponentChildren["children"];
}

export function Navigation(props: NavigationProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);
  const [currentPath, setCurrentPath] = createSignal("/");

  // Update current path on client side only
  createEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(location.pathname);
    }
  });

  const navigationItems = [
    { name: "Dashboard", href: "/", icon: "📊" },
    { name: "Targets", href: "/targets", icon: "🎯" },
    { name: "Charts", href: "/charts", icon: "📈" },
    { name: "Alerts", href: "/alerts", icon: "🚨" },
    { name: "Notifications", href: "/notifications", icon: "🔔" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return currentPath() === "/";
    }
    return currentPath().startsWith(href);
  };

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div class="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
          class="bg-white p-2 rounded-md shadow-md border border-gray-200"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      <Show when={mobileMenuOpen()}>
        <div class="lg:hidden fixed inset-0 z-40">
          <div
            class="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div class="p-4">
              <div class="flex items-center justify-between mb-8">
                <h1 class="text-xl font-bold text-gray-900">Network Monitor</h1>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  class="p-2 rounded-md hover:bg-gray-100"
                >
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <nav class="space-y-2">
                <For each={navigationItems}>
                  {item => (
                    <A
                      href={item.href}
                      class={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span class="mr-3 text-lg">{item.icon}</span>
                      {item.name}
                    </A>
                  )}
                </For>
              </nav>
            </div>
          </div>
        </div>
      </Show>

      {/* Desktop sidebar */}
      <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div class="flex min-h-0 flex-1 flex-col bg-white shadow-lg">
          <div class="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div class="flex flex-shrink-0 items-center px-4">
              <h1 class="text-xl font-bold text-gray-900">Network Monitor</h1>
            </div>
            <nav class="mt-8 flex-1 space-y-1 px-2">
              <For each={navigationItems}>
                {item => (
                  <A
                    href={item.href}
                    class={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span class="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </A>
                )}
              </For>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div class="lg:pl-64">
        <div class="flex h-screen flex-col">
          <main class="flex-1 overflow-y-auto">{props.children}</main>
        </div>
      </div>
    </div>
  );
}
