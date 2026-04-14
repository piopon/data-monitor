import { getEmailFromJwt } from "../../src/lib/AuthTokenUtils.js";

describe("AuthTokenUtils.getEmailFromJwt", () => {
  test("returns email for valid unpadded base64url payload", () => {
    const token = "header.eyJlbWFpbCI6ImRlbW9AZXhhbXBsZS5jb20ifQ.signature";
    expect(getEmailFromJwt(token)).toBe("demo@example.com");
  });

  test("returns email for valid padded base64 payload", () => {
    const token = "header.eyJlbWFpbCI6ImRlbW9AZXhhbXBsZS5jb20ifQ==.signature";
    expect(getEmailFromJwt(token)).toBe("demo@example.com");
  });

  test("returns null for invalid base64 length", () => {
    const token = "header.a.signature";
    expect(getEmailFromJwt(token)).toBeNull();
  });

  test("returns null for missing email claim", () => {
    const token = "header.eyJzdWIiOiIxMjMifQ.signature";
    expect(getEmailFromJwt(token)).toBeNull();
  });
});
