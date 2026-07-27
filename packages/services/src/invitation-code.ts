import invitationCodeContract from "./invitation-code-contract.json";

export const INVITATION_CODE_LENGTH = invitationCodeContract.length;
export const INVITATION_CODE_PATTERN = new RegExp(
  invitationCodeContract.pattern,
);

const invitationCodeAlphabet = invitationCodeContract.alphabet;

type FillRandomValues = (values: Uint32Array) => Uint32Array;

function secureRandomValues(values: Uint32Array): Uint32Array {
  return crypto.getRandomValues(values);
}

export function generateInvitationCode(
  fillRandomValues: FillRandomValues = secureRandomValues,
): string {
  const randomValues = fillRandomValues(
    new Uint32Array(INVITATION_CODE_LENGTH),
  );

  return Array.from(
    randomValues,
    (value) => invitationCodeAlphabet[value % invitationCodeAlphabet.length],
  ).join("");
}

export function isStandardInvitationCode(value: string): boolean {
  return INVITATION_CODE_PATTERN.test(value);
}
