import { type Component } from "solid-js";

export const AboutSection: Component = () => {
  return (
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Application
          </h4>
          <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span class="font-medium">Name:</span> PWA Connection Monitor
            </div>
            <div>
              <span class="font-medium">Version:</span> 1.0.0
            </div>
            <div>
              <span class="font-medium">Build:</span> 2025.10.01
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Technology
          </h4>
          <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span class="font-medium">Framework:</span> SolidStart
            </div>
            <div>
              <span class="font-medium">Runtime:</span> Bun
            </div>
            <div>
              <span class="font-medium">Database:</span> SQLite/PostgreSQL
            </div>
            <div>
              <span class="font-medium">API:</span> tRPC
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Features
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div>• Real-time monitoring</div>
          <div>• Historical charts</div>
          <div>• Push notifications</div>
          <div>• Alert rules</div>
          <div>• PWA support</div>
          <div>• Offline capability</div>
          <div>• Dark mode</div>
          <div>• Type-safe API</div>
        </div>
      </div>

      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex flex-wrap gap-4">
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm transition-colors"
          >
            GitHub Repository
          </a>
          <a
            href="https://docs.example.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm transition-colors"
          >
            Documentation
          </a>
          <a
            href="mailto:support@example.com"
            class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </div>
  );
};
