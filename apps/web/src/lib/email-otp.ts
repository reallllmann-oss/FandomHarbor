const minLength = 6;
const maxLength = 10;

// GoTrue controls the generated length, expiration and one-time verification.
export const emailOtpField = {
  minLength,
  maxLength,
  pattern: `[0-9]{${minLength},${maxLength}}`,
};

export const emailOtpPattern = new RegExp(`^${emailOtpField.pattern}$`);
