// Validates a post-login `callbackUrl` so it can only ever point to an internal
// path — never an external origin (open-redirect) or back into the auth flow.
// Returns the safe path, or null if the value should be ignored.
export function sanitizeCallbackUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let value = raw;
  // Tolerate a value that arrived still percent-encoded.
  if (value.includes("%")) {
    try {
      value = decodeURIComponent(value);
    } catch {
      return null;
    }
  }

  // Must be an absolute internal path.
  if (!value.startsWith("/")) return null;
  // Reject protocol-relative ("//host") and backslash tricks ("/\\host").
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  // Reject control characters and whitespace used to smuggle schemes.
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x20 || code === 0x7f) return null;
  }
  // Don't bounce back into the auth pages (would loop or be pointless).
  if (
    value === "/login" ||
    value.startsWith("/login?") ||
    value.startsWith("/auth/")
  ) {
    return null;
  }

  return value;
}
