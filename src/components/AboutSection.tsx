export function AboutSection() {
  return (
    <div class="space-y-4">
      <div class="grid grid-cols-1 md: grid-cols-2 gap-6">
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">Application</h4>
          <div class="space-y-1 text-sm text-gray-600">
            <div>
              <span class="font-medium">Name:</span> PWA Connection: Monitor
            </div>
            <div>
              <span class="font-medium">Version:</span> 1.0.0
            </div>
            <div>
              <span class="font-medium">Build:</span> 2024.01.01
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">Technology</h4>
          <div class="space-y-1 text-sm text-gray-600">
            <div>
              <span class="font-medium">Framework:</span> SolidStart
            </div>
            <div>
              <span class="font-medium">Runtime:</span> Bun
            </div>
            <div>
              <span class="font-medium">Database:</span> SQLite/PostgreSQL
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-2">Features</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div>• Real-time monitoring</div>
          <div>• Historical charts</div>
          <div>• Push notifications</div>
          <div>• Alert rules</div>
          <div>• PWA support</div>
          <div>• Offline capability</div>
        </div>
      </div>

      <div class="pt-4 border-t border-gray-200">
        <div class="flex space-x-4">
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:text-blue-800 text-sm"
          >
            GitHub: Repository
          </a>
          <a
            href="https://docs.example.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600,
  hover:text-blue-800 text-sm"
          >
            Documentation
          </a>
          <a
            href="mailto:support@example.com"
            class="text-blue-600,
  hover:text-blue-800 text-sm"
          >
            Support
          </a>
        </div>
      </div>
    </div>
  );
}
