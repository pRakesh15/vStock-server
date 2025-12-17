import type { EncryptedPayload } from "./erpnext.types";

export function parseEncryptedPayload(
  encrypted: string
): EncryptedPayload {
  try {
    const parsed = JSON.parse(encrypted);

    if (!parsed.iv || !parsed.content || !parsed.tag) {
      throw new Error("Invalid encrypted payload structure");
    }

    return parsed;
  } catch {
    throw new Error("Failed to parse encrypted payload");
  }
}
