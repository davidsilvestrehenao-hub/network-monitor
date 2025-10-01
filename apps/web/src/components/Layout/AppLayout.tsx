import { type Component, type JSX } from "solid-js";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: JSX.Element;
}

export const AppLayout: Component<AppLayoutProps> = props => {
  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div class="flex">
        <Sidebar />
        <main class="flex-1 p-6">{props.children}</main>
      </div>
    </div>
  );
};
