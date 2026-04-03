import test from "node:test";
import assert from "node:assert/strict";

import { DataSanitizer } from "../../src/lib/DataSanitizer.js";

test("DataSanitizer.sanitizeEmail normalizes spaces and lowercases domain", () => {
  const sanitized = DataSanitizer.sanitizeEmail("  User.Name+tag@Example.COM  ");
  assert.equal(sanitized, "User.Name+tag@example.com");
});

test("DataSanitizer.sanitizeEmail removes zero-width and bidi control characters", () => {
  const rawEmail = "\u200Buser\u202E@exa\u2060mple.com\uFEFF";
  const sanitized = DataSanitizer.sanitizeEmail(rawEmail);
  assert.equal(sanitized, "user@example.com");
});

test("DataSanitizer.sanitizeEmail returns empty string for non-string input", () => {
  assert.equal(DataSanitizer.sanitizeEmail(null), "");
  assert.equal(DataSanitizer.sanitizeEmail(undefined), "");
  assert.equal(DataSanitizer.sanitizeEmail(123), "");
});

test("DataSanitizer.sanitizeEmail returns empty string for malformed emails", () => {
  assert.equal(DataSanitizer.sanitizeEmail("invalid"), "");
  assert.equal(DataSanitizer.sanitizeEmail("user@@example.com"), "");
  assert.equal(DataSanitizer.sanitizeEmail("user@example"), "");
  assert.equal(DataSanitizer.sanitizeEmail(".user@example.com"), "");
  assert.equal(DataSanitizer.sanitizeEmail("user@-example.com"), "");
});
