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

test("DataSanitizer.sanitizeText returns single-line safe output", () => {
  const raw = "line1\nline2\t\u202Eend";
  expect(DataSanitizer.sanitizeText(raw)).toBe("line1 line2 end");
});

test("DataSanitizer.sanitizeText normalizes unicode line separators", () => {
  const raw = "line1\u2028line2\u2029line3";
  expect(DataSanitizer.sanitizeText(raw)).toBe("line1 line2 line3");
});

test("DataSanitizer.sanitizeText truncates output to requested length", () => {
  expect(DataSanitizer.sanitizeText("abcdef", 4)).toBe("abcd");
});

test("DataSanitizer.sanitizeText returns empty string for non-string input", () => {
  expect(DataSanitizer.sanitizeText(null)).toBe("");
  expect(DataSanitizer.sanitizeText(undefined)).toBe("");
  expect(DataSanitizer.sanitizeText(123)).toBe("");
});

test("DataSanitizer.sanitizeFileToken normalizes unsafe file token characters", () => {
  const raw = " ../u\nser\\name@example.com ";
  expect(DataSanitizer.sanitizeFileToken(raw)).toBe("user_name_example.com");
});

test("DataSanitizer.sanitizeFileToken returns fallback token when empty", () => {
  expect(DataSanitizer.sanitizeFileToken("...///***")).toBe("unknown");
  expect(DataSanitizer.sanitizeFileToken(null)).toBe("unknown");
});
