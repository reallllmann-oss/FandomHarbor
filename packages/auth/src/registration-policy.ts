export const MIN_REGISTRATION_NAME_LENGTH = 1;
export const MAX_REGISTRATION_NAME_LENGTH = 64;

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f-\u009f]/u;

export function normalizeRegistrationName(value: string): string {
  return value.normalize("NFKC").trim();
}

export function isValidRegistrationName(value: string): boolean {
  const normalized = normalizeRegistrationName(value);
  return (
    normalized.length >= MIN_REGISTRATION_NAME_LENGTH &&
    normalized.length <= MAX_REGISTRATION_NAME_LENGTH &&
    !CONTROL_CHARACTER_PATTERN.test(normalized)
  );
}

export async function registrationNameEmail(value: string): Promise<string> {
  const normalized = normalizeRegistrationName(value).toLowerCase();
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(normalized),
  );
  const localPart = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `${localPart}@accounts.fandom-harbor.invalid`;
}
