import type { ZodFormattedError } from "zod";

export const formatErrors = (
  errors: ZodFormattedError<Record<string, unknown>, string>
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value && value._errors.length > 0)
        return `${name}: ${value._errors.join(", ")}\n`;
      return null;
    })
    .filter(Boolean);
