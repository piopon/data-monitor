/**
 * Method used to extract email claim value from JWT payload
 * @param {String} token JWT string
 * @returns email from JWT payload when present, otherwise null
 */
export function getEmailFromJwt(token) {
  try {
    const payloadRaw = String(token).split(".")[1];
    if (!payloadRaw) {
      return null;
    }
    const payloadBase64 = payloadRaw.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(payloadBase64);
    const payload = JSON.parse(json);
    const jwtEmail = typeof payload?.email === "string" ? payload.email.trim() : "";
    return jwtEmail || null;
  } catch {
    return null;
  }
}
