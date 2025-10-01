import type { VoidComponent } from "solid-js";

const Targets: VoidComponent = () => {
  console.log("Targets component rendering...");
  
  // Simple test to see if the component is working
  return (
    <div>
      <h1>Targets Page Test</h1>
      <p>This is a simple test to see if the component is rendering.</p>
    </div>
  );
};

export default Targets;