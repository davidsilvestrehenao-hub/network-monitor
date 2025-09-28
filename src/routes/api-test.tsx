import { createSignal, For, Show, type VoidComponent } from "solid-js";

const ApiTest: VoidComponent = () => {
  const [targets, setTargets] = createSignal<unknown[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");
  const [newTarget, setNewTarget] = createSignal({ name: "", address: "" });

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/targets");
      const data = await response.json();
      setTargets(data.targets || []);
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTarget = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTarget()),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      setNewTarget({ name: "", address: "" });
      await fetchTargets(); // Refresh the list
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const runSpeedTest = async (targetId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/targets/${targetId}/speed-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timeout: 10000 }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">
          API Testing Interface
        </h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div class="space-y-6">
            {/* Get Targets */}
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold mb-4">Get All Targets</h2>
              <button
                onClick={fetchTargets}
                disabled={loading()}
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading() ? "Loading..." : "Fetch Targets"}
              </button>
            </div>

            {/* Create Target */}
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold mb-4">Create New Target</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newTarget().name}
                    onInput={e =>
                      setNewTarget({
                        ...newTarget(),
                        name: e.currentTarget.value,
                      })
                    }
                    class="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g., Google DNS"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newTarget().address}
                    onInput={e =>
                      setNewTarget({
                        ...newTarget(),
                        address: e.currentTarget.value,
                      })
                    }
                    class="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g., https://8.8.8.8"
                  />
                </div>
                <button
                  onClick={createTarget}
                  disabled={
                    loading() || !newTarget().name || !newTarget().address
                  }
                  class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {loading() ? "Creating..." : "Create Target"}
                </button>
              </div>
            </div>

            {/* Targets List */}
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold mb-4">Current Targets</h2>
              <div class="space-y-2">
                <For
                  each={
                    targets() as { id: string; name: string; address: string }[]
                  }
                >
                  {target => (
                    <div class="border border-gray-200 rounded p-3">
                      <div class="flex justify-between items-start">
                        <div>
                          <h3 class="font-medium">{target.name}</h3>
                          <p class="text-sm text-gray-600">{target.address}</p>
                          <p class="text-xs text-gray-500">ID: {target.id}</p>
                        </div>
                        <button
                          onClick={() => runSpeedTest(target.id)}
                          disabled={loading()}
                          class="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  )}
                </For>
                <Show when={targets().length === 0}>
                  <p class="text-gray-500 text-sm">No targets found</p>
                </Show>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">API Response</h2>
            <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {result() || "Click a button to test the API"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
