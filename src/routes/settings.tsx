import type { VoidComponent } from "solid-js";

const Settings: VoidComponent = () => {
  console.log("Settings component rendering...");

  // Simple test to see if the component is working
  return (
    <div>
      <h1>Settings Page Test</h1>
      <p>This is a simple test to see if the component is rendering.</p>
    </div>
  );
};

export default Settings;
