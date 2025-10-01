import { type Component, onMount } from "solid-js";
import { Chart, Title, Tooltip, Legend, Colors } from "chart.js";
import { Bar } from "solid-chartjs";

Chart.register(Title, Tooltip, Legend, Colors);

export interface UptimeDataPoint {
  date: Date;
  uptime: number;
  downtime: number;
}

interface UptimeChartProps {
  data: UptimeDataPoint[];
  title?: string;
}

export const UptimeChart: Component<UptimeChartProps> = props => {
  onMount(() => {
    // Register chart.js components if needed
  });

  const chartData = () => {
    const labels = props.data.map(d =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(d.date)
    );

    return {
      labels,
      datasets: [
        {
          label: "Uptime %",
          data: props.data.map(d => d.uptime),
          backgroundColor: "rgba(34, 197, 94, 0.8)",
          borderColor: "rgb(34, 197, 94)",
          borderWidth: 1,
        },
        {
          label: "Downtime %",
          data: props.data.map(d => d.downtime),
          backgroundColor: "rgba(239, 68, 68, 0.8)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 1,
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
        max: 100,
        title: {
          display: true,
          text: "Percentage (%)",
        },
      },
      x: {
        stacked: true,
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  };

  return (
    <div class="h-64 w-full">
      <Bar data={chartData()} options={chartOptions} />
    </div>
  );
};
