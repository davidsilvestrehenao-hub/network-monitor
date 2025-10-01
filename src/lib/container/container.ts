import { getBrowserAppContext } from "./container.browser";
import { getServerAppContext } from "./container.server";
import type { AppContext } from "./types";

export async function getAppContext(): Promise<AppContext> {
  if (typeof window !== "undefined") {
    return getBrowserAppContext();
  }
  return getServerAppContext();
}
