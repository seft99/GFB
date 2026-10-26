import "server-only";
import type { ContactValues } from "./schema.ts";

export type Inquiry = ContactValues & { locale: string; source: string };
export type DeliveryResult = "sent" | "unavailable";

/**
 * Delivery is intentionally disabled until GFB approves the email provider, recipient,
 * privacy notice and retention policy (see docs/content-inventory.md). Implement the
 * provider here; the Server Action and UI already handle every result.
 */
export async function deliverInquiry(inquiry: Inquiry): Promise<DeliveryResult> {
  void inquiry;
  return "unavailable";
}
