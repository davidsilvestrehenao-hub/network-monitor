import { type Component, onMount } from "solid-js";
import { Chart, Title, Tooltip, Legend, Colors } from "chart.js";
import { Line } from "solid-chartjs";

Chart.register(Title, Tooltip, Legend, Colors);

export interface PerformanceDataPoint {
  timestamp: Date;
  ping: number;
  download?: number;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  title?: string;
}

export const PerformanceChart: Component<PerformanceChartProps> = props => {
  onMount(() => {
    // Register chart.js components if needed
  });

  const chartData = () => {
    const labels = props.data.map(d =>
      new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(d.timestamp)
    );

    return {
      labels,
      datasets: [
        {
          label: "Ping (ms)",
          data: props.data.map(d => d.ping),
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        // Justification: Chart.js requires static config object - props accessed in IIFE for static initialization
        // eslint-disable-next-line solid/reactivity
        display: (() => !!props.title)(),
        // eslint-disable-next-line solid/reactivity
        text: (() => props.title || "")(),
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Ping (ms)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
    },
  };

  return (
    <div class="h-64 w-full">
      <Line data={chartData()} options={chartOptions} />
    </div>
  );
};
