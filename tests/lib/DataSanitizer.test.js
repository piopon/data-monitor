import { DataSanitizer } from "../../src/lib/DataSanitizer.js";

test("DataSanitizer.sanitizeEmail trims surrounding spaces and lowercases domain", () => {
  const sanitized = DataSanitizer.sanitizeEmail("  User.Name+tag@Example.COM  ");
  expect(sanitized).toBe("User.Name+tag@example.com");
});

test("DataSanitizer.sanitizeEmail rejects emails containing whitespace", () => {
  expect(DataSanitizer.sanitizeEmail("a b@x.com")).toBe("");
  expect(DataSanitizer.sanitizeEmail("user@exa mple.com")).toBe("");
  expect(DataSanitizer.sanitizeEmail("user\t@example.com")).toBe("");
});

test("DataSanitizer.sanitizeEmail removes zero-width and bidi control characters", () => {
  const rawEmail = "\u200Buser\u202E@exa\u2060mple.com\uFEFF";
  const sanitized = DataSanitizer.sanitizeEmail(rawEmail);
  expect(sanitized).toBe("user@example.com");
});

test("DataSanitizer.sanitizeEmail returns empty string for non-string input", () => {
  expect(DataSanitizer.sanitizeEmail(null)).toBe("");
  expect(DataSanitizer.sanitizeEmail(undefined)).toBe("");
  expect(DataSanitizer.sanitizeEmail(123)).toBe("");
});

test("DataSanitizer.sanitizeEmail returns empty string for malformed emails", () => {
  expect(DataSanitizer.sanitizeEmail("invalid")).toBe("");
  expect(DataSanitizer.sanitizeEmail("user@@example.com")).toBe("");
  expect(DataSanitizer.sanitizeEmail("user@example")).toBe("");
  expect(DataSanitizer.sanitizeEmail(".user@example.com")).toBe("");
  expect(DataSanitizer.sanitizeEmail("user@-example.com")).toBe("");
});
