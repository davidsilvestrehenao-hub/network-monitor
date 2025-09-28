import { createMemo, Show } from "solid-js";
import { Line } from "solid-chartjs";
import { ChartData, ChartOptions } from "chart.js";
import { Target } from "~/lib/services/interfaces/ITargetRepository";

interface SuccessRateChartProps {
  targets: Target[];
  timeRange: "1h" | "24h" | "7d" | "30d";
}

export function SuccessRateChart(props: SuccessRateChartProps) {
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

    // Group results by target and time bucket
    const bucketSize =
      props.timeRange === "1h"
        ? 5 // 5 minutes for 1 hour
        : props.timeRange === "24h"
          ? 60 // 1 hour for 24 hours
          : props.timeRange === "7d"
            ? 360 // 6 hours for 7 days
            : 1440; // 1 day for 30 days
    const targetGroups = new Map<
      string,
      Map<number, { success: number; total: number }>
    >();

    for (const target of props.targets) {
      const results = target.speedTestResults.filter(
        result => new Date(result.createdAt) >= cutoffTime
      );

      const buckets = new Map<number, { success: number; total: number }>();

      for (const result of results) {
        const time = new Date(result.createdAt).getTime();
        const bucket = Math.floor(time / (bucketSize * 60 * 1000));

        if (!buckets.has(bucket)) {
          buckets.set(bucket, { success: 0, total: 0 });
        }

        const bucketData = buckets.get(bucket);
        if (!bucketData) continue;
        bucketData.total++;
        if (result.status === "SUCCESS") {
          bucketData.success++;
        }
      }

      targetGroups.set(target.id, buckets);
    }

    // Create datasets for each target
    const colors = [
      { border: "rgb(34, 197, 94)", background: "rgba(34, 197, 94, 0.1)" },
      { border: "rgb(59, 130, 246)", background: "rgba(59, 130, 246, 0.1)" },
      { border: "rgb(245, 158, 11)", background: "rgba(245, 158, 11, 0.1)" },
      { border: "rgb(239, 68, 68)", background: "rgba(239, 68, 68, 0.1)" },
      { border: "rgb(139, 92, 246)", background: "rgba(139, 92, 246, 0.1)" },
    ];

    const datasets = Array.from(targetGroups.entries()).map(
      ([targetId, buckets], index) => {
        const target = props.targets.find(t => t.id === targetId);
        const color = colors[index % colors.length];

        const data = Array.from(buckets.entries())
          .map(([bucket, stats]) => ({
            x: new Date(bucket * bucketSize * 60 * 1000),
            y: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
          }))
          .sort((a, b) => a.x.getTime() - b.x.getTime());

        return {
          label: target?.name || `Target ${targetId.slice(-4)}`,
          data,
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
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          /* eslint-disable solid/reactivity */
          unit:
            props.timeRange === "1h"
              ? "minute"
              : props.timeRange === "24h"
                ? "hour"
                : "day",
          /* eslint-enable solid/reactivity */
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
          text: "Success Rate (%)",
        },
        min: 0,
        max: 100,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          callback: value => `${value}%`,
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
        <div class="h-64 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <div class="text-4xl mb-2">📊</div>
            <p>No success rate data available for the selected time range</p>
            <p class="text-sm">Run some speed tests to see success rates</p>
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
