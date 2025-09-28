import { Navigate } from "@solidjs/router";
import type { VoidComponent } from "solid-js";

const Home: VoidComponent = () => {
  // Redirect to dashboard
  return <Navigate href="/dashboard" />;
};

export default Home;
