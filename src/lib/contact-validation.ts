export type ContactPayload = {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  interest: string;
  category: string;
  message: string;
  source: string;
  website: string;
};

export type ContactErrors = Partial<Record<keyof ContactPayload, string>>;

const limits: Partial<Record<keyof ContactPayload, number>> = {
  name: 100,
  company: 160,
  email: 254,
  phone: 50,
  country: 100,
  interest: 100,
  category: 120,
  message: 3000,
  source: 300,
  website: 200
};

export function normalizeContact(input: unknown): ContactPayload {
  const value = typeof input === "object" && input ? input as Record<string, unknown> : {};
  return Object.fromEntries(
    Object.keys(limits).map((key) => [key, typeof value[key] === "string" ? value[key].trim() : ""])
  ) as ContactPayload;
}

export function validateContact(input: ContactPayload): ContactErrors {
  const errors: ContactErrors = {};
  if (input.website) errors.website = "Invalid submission.";
  if (input.name.length < 2) errors.name = "Please enter your name.";
  if (!input.company) errors.company = "Please enter your company name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.email = "Please enter a valid business email.";
  if (!input.interest) errors.interest = "Please select an area of interest.";
  if (input.message.length < 10) errors.message = "Please provide a little more detail.";
  for (const [key, max] of Object.entries(limits) as [keyof ContactPayload, number][]) {
    if (input[key].length > max) errors[key] = `Maximum ${max} characters.`;
  }
  return errors;
}
