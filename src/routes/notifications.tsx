import type { VoidComponent } from "solid-js";

const Notifications: VoidComponent = () => {
  console.log("Notifications component rendering...");

  // Simple test to see if the component is working
  return (
    <div>
      <h1>Notifications Page Test</h1>
      <p>This is a simple test to see if the component is rendering.</p>
    </div>
  );
};

export default Notifications;
