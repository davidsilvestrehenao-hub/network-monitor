import { type VoidComponent } from "solid-js";
import { A } from "@solidjs/router";

const Home: VoidComponent = () => {
  return (
    <main class="min-h-screen bg-gradient-to-b from-green-900 via-green-700 to-green-500 flex flex-col items-center justify-center">
      <div class="w-full max-w-6xl flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 class="text-5xl md:text-7xl font-extrabold leading-none tracking-tight text-white">
          Network <span class="text-green-300">Monitor</span> PWA
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl">
          <A
            class="group max-w-md flex flex-col gap-4 p-6 rounded-xl text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            href="/dashboard"
          >
            <h3 class="text-2xl font-bold group-hover:text-green-300 transition-colors">
              Dashboard →
            </h3>
            <div class="text-lg text-gray-200">
              Monitor your internet connection quality in real-time with live
              performance metrics and alerts.
            </div>
          </A>

          <A
            class="group max-w-md flex flex-col gap-4 p-6 rounded-xl text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            href="/charts"
          >
            <h3 class="text-2xl font-bold group-hover:text-green-300 transition-colors">
              Charts →
            </h3>
            <div class="text-lg text-gray-200">
              View historical performance data and analytics with interactive
              charts and trends.
            </div>
          </A>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl">
          <A
            class="group max-w-md flex flex-col gap-4 p-6 rounded-xl text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            href="/targets"
          >
            <h3 class="text-2xl font-bold group-hover:text-green-300 transition-colors">
              Targets →
            </h3>
            <div class="text-lg text-gray-200">
              Manage monitoring targets and configure connection endpoints for
              testing.
            </div>
          </A>

          <A
            class="group max-w-md flex flex-col gap-4 p-6 rounded-xl text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            href="/alerts"
          >
            <h3 class="text-2xl font-bold group-hover:text-green-300 transition-colors">
              Alerts →
            </h3>
            <div class="text-lg text-gray-200">
              Configure alert rules and notifications for connection issues and
              performance thresholds.
            </div>
          </A>
        </div>

        <div class="text-center text-white/80 text-lg max-w-2xl">
          <p class="mb-4">
            A powerful Progressive Web App for monitoring your internet
            connection quality with real-time alerts and historical analytics.
          </p>
          <div class="flex flex-wrap justify-center gap-4 text-sm">
            <span class="px-3 py-1 bg-white/20 rounded-full">
              Real-time Monitoring
            </span>
            <span class="px-3 py-1 bg-white/20 rounded-full">
              Performance Analytics
            </span>
            <span class="px-3 py-1 bg-white/20 rounded-full">
              Push Notifications
            </span>
            <span class="px-3 py-1 bg-white/20 rounded-full">
              Offline Capable
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
