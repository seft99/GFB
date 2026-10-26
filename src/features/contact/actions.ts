"use server";

import { headers } from "next/headers";
import { divisions } from "@/src/content/catalog";
import { isLocale } from "@/src/i18n/config";
import { deliverInquiry } from "./delivery";
import { createMemoryRateLimiter } from "./rate-limit";
import {
  hasErrors,
  isSpam,
  normalizeContact,
  validateContact,
  withoutHoneypot,
  type ContactErrors,
  type ContactValues
} from "./schema";

export type InquiryStatus = "idle" | "invalid" | "success" | "unavailable" | "rateLimited" | "rejected";

export type InquiryState = {
  status: InquiryStatus;
  errors?: ContactErrors;
  /** Echoed back so the form keeps its values when JavaScript is unavailable. */
  values?: ContactValues;
};

const limiter = createMemoryRateLimiter({ limit: 5, windowMs: 60_000 });
const allowedInterests = divisions.map((division) => division.id);

export async function submitInquiry(_previous: InquiryState, formData: FormData): Promise<InquiryState> {
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
  if (!(await limiter.consume(ip))) return { status: "rateLimited" };

  const payload = normalizeContact(formData);
  const values = withoutHoneypot(payload);

  // Silently accept honeypot submissions so bots get no signal.
  if (isSpam(payload)) return { status: "success" };

  const errors = validateContact(payload, allowedInterests);
  if (hasErrors(errors)) return { status: "invalid", errors, values };

  const locale = String(formData.get("locale") ?? "");
  const result = await deliverInquiry({
    ...values,
    locale: isLocale(locale) ? locale : "en",
    source: requestHeaders.get("referer") ?? ""
  });
  return result === "sent" ? { status: "success" } : { status: "unavailable", values };
}
