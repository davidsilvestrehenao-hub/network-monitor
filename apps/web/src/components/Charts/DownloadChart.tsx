import { createMemo, Show } from "solid-js";
import { Line } from "solid-chartjs";
import type { ChartData, ChartOptions } from "chart.js";
import type { Target } from "@network-monitor/shared";

interface DownloadChartProps {
  targets: Target[];
  timeRange: "1h" | "24h" | "7d" | "30d";
}

export function DownloadChart(props: DownloadChartProps) {
  const chartData = createMemo((): ChartData<"line"> => {
    const now = new Date();
    const timeRangeHours = {
      "1h": 1,
      "24h": 24,
      "7d": 24 * 7,
      "30d": 24 * 30,
    }[props.timeRange];

    const cutoffTime = new Date(
      now.getTime() - timeRangeHours * 60 * 60 * 1000
    );

    // Collect all download results from the selected time range
    const allResults = props.targets
      .flatMap(target =>
        (target.speedTestResults || [])
          .filter(
            result =>
              new Date(result.createdAt) >= cutoffTime &&
              result.status === "SUCCESS" &&
              result.download !== null
          )
          .map(result => ({
            ...result,
            targetName: target.name,
            targetId: target.id,
          }))
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    // Group by target
    const targetGroups = new Map<string, typeof allResults>();
    for (const result of allResults) {
      if (!targetGroups.has(result.targetId)) {
        targetGroups.set(result.targetId, []);
      }
      const group = targetGroups.get(result.targetId);
      if (group) {
        group.push(result);
      }
    }

    // Create datasets for each target
    const colors = [
      { border: "rgb(16, 185, 129)", background: "rgba(16, 185, 129, 0.1)" },
      { border: "rgb(59, 130, 246)", background: "rgba(59, 130, 246, 0.1)" },
      { border: "rgb(245, 158, 11)", background: "rgba(245, 158, 11, 0.1)" },
      { border: "rgb(239, 68, 68)", background: "rgba(239, 68, 68, 0.1)" },
      { border: "rgb(139, 92, 246)", background: "rgba(139, 92, 246, 0.1)" },
    ];

    const datasets = Array.from(targetGroups.entries()).map(
      ([targetId, results], index) => {
        const target = props.targets.find(t => t.id === targetId);
        const color = colors[index % colors.length];

        return {
          label: target?.name || `Target ${targetId.slice(-4)}`,
          data: results.map(result => ({
            x: new Date(result.createdAt).getTime(),
            y: result.download ?? 0,
          })),
          borderColor: color.border,
          backgroundColor: color.background,
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 3,
          pointHoverRadius: 5,
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
        display: false,
      },
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: context => {
            const dataPoint = context[0].raw as { x: Date; y: number };
            return dataPoint.x.toLocaleString();
          },
          label: context => {
            return `${context.dataset.label}: ${context.parsed.y} Mbps`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          // Justification: Chart.js requires static config object - props accessed in IIFE for static initialization
          unit: (() => {
            // eslint-disable-next-line solid/reactivity
            switch (props.timeRange) {
              case "1h":
                return "minute";

              case "24h":
                return "hour";
              default:
                return "day";
            }
          })(),
          displayFormats: {
            minute: "HH:mm",
            hour: "MMM dd HH:mm",
            day: "MMM dd",
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
          text: "Download Speed (Mbps)",
        },
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
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
        <div class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div class="text-center">
            <div class="text-4xl mb-2">📊</div>
            <p>No download speed data available for the selected time range</p>
            <p class="text-sm">
              Run some speed tests to see download performance
            </p>
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
