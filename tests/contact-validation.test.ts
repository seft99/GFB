import assert from "node:assert/strict";
import test from "node:test";
import { normalizeContact, validateContact } from "../src/lib/contact-validation.ts";

const valid = {
  name: "Ana Buyer",
  company: "Example Beverages",
  email: "ana@example.com",
  phone: "+34 600 000 000",
  country: "Spain",
  interest: "packaging-solutions",
  category: "sleek cans",
  message: "We need a packaging review for a new beverage line.",
  source: "/en/packaging-solutions/cans",
  website: ""
};

test("valid inquiries pass shared validation", () => {
  assert.deepEqual(validateContact(normalizeContact(valid)), {});
});

test("required fields and email format are rejected", () => {
  const errors = validateContact(normalizeContact({ ...valid, name: "", email: "invalid", interest: "", message: "short" }));
  assert.ok(errors.name);
  assert.ok(errors.email);
  assert.ok(errors.interest);
  assert.ok(errors.message);
});

test("honeypot submissions are rejected", () => {
  assert.ok(validateContact(normalizeContact({ ...valid, website: "spam.example" })).website);
});
