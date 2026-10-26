/**
 * Inquiry validation shared by the browser and the Server Action.
 * Errors are codes, not messages, so each locale renders its own copy.
 */

export const contactFields = [
  "name",
  "company",
  "email",
  "phone",
  "country",
  "interest",
  "category",
  "message"
] as const;
export type ContactField = (typeof contactFields)[number];

export type ContactValues = Record<ContactField, string>;
/** `website` is a honeypot: hidden from people, filled in by naive bots. */
export type ContactPayload = ContactValues & { website: string };

export type ContactError =
  { code: "required" | "email" | "tooShort" | "invalidOption" } | { code: "tooLong"; max: number };
export type ContactErrors = Partial<Record<ContactField, ContactError>>;

export const fieldLimits: Record<ContactField, number> = {
  name: 100,
  company: 160,
  email: 254,
  phone: 50,
  country: 100,
  interest: 100,
  category: 120,
  message: 3000
};

export const requiredFields: readonly ContactField[] = ["name", "company", "email", "interest", "message"];

const minimumLength: Partial<Record<ContactField, number>> = { name: 2, message: 10 };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Source = FormData | Record<string, unknown> | null | undefined;

export function normalizeContact(source: Source): ContactPayload {
  const read = (key: string) => {
    const value = source instanceof FormData ? source.get(key) : source?.[key];
    return typeof value === "string" ? value.trim() : "";
  };
  return {
    ...(Object.fromEntries(contactFields.map((field) => [field, read(field)])) as ContactValues),
    website: read("website")
  };
}

export function withoutHoneypot(payload: ContactPayload): ContactValues {
  return Object.fromEntries(contactFields.map((field) => [field, payload[field]])) as ContactValues;
}

export function isSpam(payload: ContactPayload) {
  return payload.website.length > 0;
}

export function validateContact(payload: ContactPayload, allowedInterests: readonly string[]): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of contactFields) {
    const value = payload[field];
    if (!value) {
      if (requiredFields.includes(field)) errors[field] = { code: "required" };
      continue;
    }
    if (value.length > fieldLimits[field]) errors[field] = { code: "tooLong", max: fieldLimits[field] };
    else if (value.length < (minimumLength[field] ?? 0)) errors[field] = { code: "tooShort" };
  }
  if (!errors.email && payload.email && !emailPattern.test(payload.email)) errors.email = { code: "email" };
  if (!errors.interest && payload.interest && !allowedInterests.includes(payload.interest)) {
    errors.interest = { code: "invalidOption" };
  }
  return errors;
}

export function hasErrors(errors: ContactErrors) {
  return Object.keys(errors).length > 0;
}
