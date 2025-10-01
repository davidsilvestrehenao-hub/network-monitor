import type { ZodFormattedError } from "zod";
import { clientScheme } from "./schema";

export const formatErrors = (
  errors: ZodFormattedError<unknown, string>
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && typeof value === "object" && "_errors" in value && Array.isArray(value._errors) && value._errors.length > 0)
        return `${name}: ${value._errors.join(", ")}\n`;
      return null;
    })
    .filter(Boolean);

const env = clientScheme.safeParse(import.meta.env);

if (env.success === false) {
  const errors = formatErrors(env.error.format());
  // Note: Cannot use logger here as it's not yet initialized during module load
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:", errors.join(""));
  throw new Error("Invalid environment variables");
}

export const clientEnv = env.data;
