import assert from "node:assert/strict";
import test from "node:test";
import {
  fieldLimits,
  isSpam,
  normalizeContact,
  validateContact,
  withoutHoneypot
} from "../../src/features/contact/schema.ts";

const interests = ["packaging-solutions", "raw-materials"];

const valid = {
  name: "Ana Buyer",
  company: "Example Beverages",
  email: "ana@example.com",
  phone: "+34 600 000 000",
  country: "Spain",
  interest: "packaging-solutions",
  category: "sleek cans",
  message: "We need a packaging review for a new beverage line.",
  website: ""
};

test("a complete inquiry has no errors", () => {
  assert.deepEqual(validateContact(normalizeContact(valid), interests), {});
});

test("normalization trims strings, ignores non-strings and reads FormData", () => {
  const fromObject = normalizeContact({ ...valid, name: "  Ana  ", phone: 42 });
  assert.equal(fromObject.name, "Ana");
  assert.equal(fromObject.phone, "");

  const formData = new FormData();
  formData.set("email", " ana@example.com ");
  assert.equal(normalizeContact(formData).email, "ana@example.com");
  assert.equal(normalizeContact(null).name, "");
});

test("required fields report the required code", () => {
  const errors = validateContact(normalizeContact({}), interests);
  assert.deepEqual(Object.keys(errors).sort(), ["company", "email", "interest", "message", "name"]);
  assert.ok(Object.values(errors).every((error) => error?.code === "required"));
});

test("format, length and option rules report specific codes", () => {
  const errors = validateContact(
    normalizeContact({
      ...valid,
      email: "invalid",
      name: "A",
      message: "x".repeat(fieldLimits.message + 1),
      interest: "spaceships"
    }),
    interests
  );
  assert.deepEqual(errors.email, { code: "email" });
  assert.deepEqual(errors.name, { code: "tooShort" });
  assert.deepEqual(errors.message, { code: "tooLong", max: fieldLimits.message });
  assert.deepEqual(errors.interest, { code: "invalidOption" });
});

test("optional fields may be empty but are still length-limited", () => {
  assert.deepEqual(validateContact(normalizeContact({ ...valid, phone: "", country: "" }), interests), {});
  const errors = validateContact(
    normalizeContact({ ...valid, country: "x".repeat(fieldLimits.country + 1) }),
    interests
  );
  assert.equal(errors.country?.code, "tooLong");
});

test("the honeypot flags spam and is stripped from delivered values", () => {
  const payload = normalizeContact({ ...valid, website: "spam.example" });
  assert.ok(isSpam(payload));
  assert.ok(!("website" in withoutHoneypot(payload)));
});
