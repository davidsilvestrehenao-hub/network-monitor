import { createSignal, createEffect, Show, type VoidComponent } from "solid-js";
import "~/lib/chart-config";
import { useCommandQuery, useEventBus } from "~/lib/frontend/container";
// import * as prpc from "~/server/prpc";
import type {
  Target,
  SpeedTestResult,
} from "@network-monitor/shared";
import type {
  FrontendEvents,
  BackendEvents,
} from "@network-monitor/shared";
import { PerformanceChart } from "~/components/PerformanceChart";
import { StatusCard } from "~/components/StatusCard";
import { RecentActivity } from "~/components/RecentActivity";

interface DashboardStats {
  totalTargets: number;
  activeTargets: number;
  totalTests: number;
  successRate: number;
  averagePing: number;
  averageDownload: number;
}

const Dashboard: VoidComponent = () => {
  const commandQuery = useCommandQuery();
  const eventBus = useEventBus();

  const [targets, setTargets] = createSignal<Target[]>([]);
  const [recentResults, setRecentResults] = createSignal<SpeedTestResult[]>([]);
  const [stats, setStats] = createSignal<DashboardStats>({
    totalTargets: 0,
    activeTargets: 0,
    totalTests: 0,
    successRate: 0,
    averagePing: 0,
    averageDownload: 0,
  });
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Load dashboard data
  createEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Loading dashboard data...");

        // Load targets using the service
        const targetList = await commandQuery.getTargets();
        console.log("Loaded targets:", targetList);
        setTargets(targetList);

        // Load recent results for all targets
        const allResults: SpeedTestResult[] = [];
        for (const target of targetList) {
          const results = await commandQuery.getTargetResults(target.id, 5);
          allResults.push(...results);
        }

        // Sort by creation date and take most recent
        const sortedResults = allResults
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 10);
        setRecentResults(sortedResults);

        // Calculate stats
        const activeTargets = await commandQuery.getActiveTargets();
        const successfulResults = allResults.filter(
          r => r.status === "SUCCESS"
        );
        const successRate =
          allResults.length > 0
            ? (successfulResults.length / allResults.length) * 100
            : 0;
        const averagePing =
          successfulResults.length > 0
            ? successfulResults.reduce((sum, r) => sum + (r.ping || 0), 0) /
              successfulResults.length
            : 0;
        const averageDownload =
          successfulResults.length > 0
            ? successfulResults.reduce((sum, r) => sum + (r.download || 0), 0) /
              successfulResults.length
            : 0;

        setStats({
          totalTargets: targetList.length,
          activeTargets: activeTargets.length,
          totalTests: allResults.length,
          successRate: Math.round(successRate * 100) / 100,
          averagePing: Math.round(averagePing * 100) / 100,
          averageDownload: Math.round(averageDownload * 100) / 100,
        });

        console.log("Dashboard data loaded successfully");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  });

  // Listen for real-time updates
  createEffect(() => {
    eventBus.onTyped<FrontendEvents["TARGETS_LOADED"]>(
      "TARGETS_LOADED",
      data => {
        setTargets(data.targets as Target[]);
      }
    );

    eventBus.onTyped<BackendEvents["SPEED_TEST_COMPLETED"]>(
      "SPEED_TEST_COMPLETED",
      data => {
        // Add new result to recent results
        setRecentResults(prev => [
          data.result as SpeedTestResult,
          ...prev.slice(0, 9),
        ]);
      }
    );
  });

  const handleRunAllTests = async () => {
    try {
      for (const target of targets()) {
        await commandQuery.runSpeedTest(target.id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to run speed tests"
      );
    }
  };

  return (
    <div>
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p class="text-gray-600">
          Monitor your internet connection quality in real-time
        </p>
      </div>

      {loading() && (
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p class="mt-4 text-gray-600">Loading dashboard...</p>
          <p class="mt-2 text-sm text-gray-500">
            Debug: loading={loading()}, error={error()}
          </p>
        </div>
      )}

      {error() && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong class="font-bold">Error:</strong>
          <span class="block sm:inline"> {error()}</span>
        </div>
      )}

      <Show when={!loading() && !error()}>
        {/* Stats Cards */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="Total Targets"
            value={stats().totalTargets.toString()}
            icon="🎯"
            color="blue"
          />
          <StatusCard
            title="Active Monitoring"
            value={stats().activeTargets.toString()}
            icon="📡"
            color="green"
          />
          <StatusCard
            title="Success Rate"
            value={`${stats().successRate}%`}
            icon="✅"
            color="green"
          />
          <StatusCard
            title="Total Tests"
            value={stats().totalTests.toString()}
            icon="📊"
            color="purple"
          />
        </div>

        {/* Performance Overview */}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Average Performance
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Ping</span>
                <span class="text-2xl font-bold text-blue-600">
                  {stats().averagePing}ms
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Download Speed</span>
                <span class="text-2xl font-bold text-green-600">
                  {stats().averageDownload} Mbps
                </span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div class="space-y-3">
              <button
                onClick={handleRunAllTests}
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Run All Speed Tests
              </button>
              <a
                href="/targets"
                class="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-center"
              >
                Manage Targets
              </a>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activity */}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Performance Trends
            </h3>
            <PerformanceChart targets={targets()} />
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <RecentActivity results={recentResults()} />
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Dashboard;
