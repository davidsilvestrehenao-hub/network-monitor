import { createMemo, Show } from "solid-js";
import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "solid-chartjs";
import type {
  Target,
  SpeedTestResult,
} from "~/lib/services/interfaces/ITargetRepository";

interface PerformanceChartProps {
  targets: Target[];
}

export function PerformanceChart(props: PerformanceChartProps) {
  // Get the last 24 hours of data for all targets
  const chartData = createMemo((): ChartData<"line"> => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Collect all results from the last 24 hours
    const allResults: Array<SpeedTestResult & { targetName: string }> = [];

    for (const target of props.targets) {
      const recentResults = target.speedTestResults
        .filter(result => new Date(result.createdAt) >= twentyFourHoursAgo)
        .map(result => ({ ...result, targetName: target.name }));
      allResults.push(...recentResults);
    }

    // Sort by creation time
    allResults.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Group by target for different lines
    const targetGroups = new Map<string, SpeedTestResult[]>();
    for (const result of allResults) {
      if (!targetGroups.has(result.targetName)) {
        targetGroups.set(result.targetName, []);
      }
      const group = targetGroups.get(result.targetName);
      if (group) {
        group.push(result);
      }
    }

    // Create datasets for each target
    const datasets = Array.from(targetGroups.entries()).map(
      ([targetName, results], index) => {
        const colors = [
          {
            border: "rgb(59, 130, 246)",
            background: "rgba(59, 130, 246, 0.1)",
          },
          {
            border: "rgb(16, 185, 129)",
            background: "rgba(16, 185, 129, 0.1)",
          },
          {
            border: "rgb(245, 158, 11)",
            background: "rgba(245, 158, 11, 0.1)",
          },
          { border: "rgb(239, 68, 68)", background: "rgba(239, 68, 68, 0.1)" },
          {
            border: "rgb(139, 92, 246)",
            background: "rgba(139, 92, 246, 0.1)",
          },
        ];

        const color = colors[index % colors.length];

        return {
          label: targetName,
          data: results.map(result => ({
            x: new Date(result.createdAt).getTime(),
            y: result.ping || 0,
          })),
          borderColor: color.border,
          backgroundColor: color.background,
          borderWidth: 2,
          fill: false,
          tension: 0.1,
        };
      }
    );

    return {
      datasets,
    };
  });

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Ping Performance (Last 24 Hours)",
      },
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "hour",
          displayFormats: {
            hour: "MMM dd HH:mm",
          },
        },
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Ping (ms)",
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  return (
    <Show
      when={chartData().datasets.length > 0}
      fallback={
        <div class="h-64 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <div class="text-4xl mb-2">📊</div>
            <p>No performance data available</p>
            <p class="text-sm">Run some speed tests to see charts</p>
          </div>
        </div>
      }
    >
      <div class="h-64">
        <Line data={chartData()} options={chartOptions} />
      </div>
    </Show>
  );
}
