const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const INDIAN_PHONE_REGEX = /^\+91[6-9]\d{9}$/;
const NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  return PASSWORD_REGEX.test(value);
}

export function isValidIndianPhone(value: string): boolean {
  return INDIAN_PHONE_REGEX.test(value.trim());
}

export function isEmailOrPhone(value: string): 'email' | 'phone' | null {
  const trimmed = value.trim();
  if (isValidEmail(trimmed)) return 'email';
  if (isValidIndianPhone(trimmed)) return 'phone';
  return null;
}

/** While typing: email if letters/@, phone if + or mostly digits. */
export function detectLoginIdentifierMode(value: string): 'email' | 'phone' | 'unknown' {
  const trimmed = value.trim();
  if (!trimmed) return 'unknown';
  if (trimmed.includes('@') || /[a-zA-Z]/.test(trimmed)) return 'email';
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+') || digits.length >= 3) return 'phone';
  return 'unknown';
}

/** Normalize 10-digit Indian mobiles to +91XXXXXXXXXX. */
export function normalizeIndianPhoneInput(value: string): string {
  const trimmed = value.trim().replace(/[\s-]/g, '');
  if (/^\+91[6-9]\d{9}$/.test(trimmed)) return trimmed;
  if (/^[6-9]\d{9}$/.test(trimmed)) return `+91${trimmed}`;
  if (/^91[6-9]\d{9}$/.test(trimmed)) return `+${trimmed}`;
  return trimmed;
}

export function validateEmail(value: string, required = true): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? 'Email is required' : null;
  if (!isValidEmail(trimmed)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(value))
    return 'Password must include at least one uppercase letter';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value))
    return 'Password must include at least one special character';
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirm: string
): string | null {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return null;
}

export function validateName(value: string, label: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required`;
  if (!NAME_REGEX.test(trimmed))
    return `${label} must be 2–50 characters and contain only letters`;
  return null;
}

export function validateOptionalName(
  value: string,
  label: string
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!NAME_REGEX.test(trimmed))
    return `${label} must be 2–50 characters and contain only letters`;
  return null;
}

export function validateIndianPhone(
  value: string,
  required = false
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? 'Phone number is required' : null;
  if (!trimmed.startsWith('+91'))
    return 'Indian numbers must start with +91';
  if (!isValidIndianPhone(trimmed))
    return 'Enter a valid Indian number (+91XXXXXXXXXX)';
  return null;
}

export function validateEmailOrPhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Email or phone number is required';
  if (!isEmailOrPhone(trimmed))
    return 'Enter a valid email or Indian phone (+91XXXXXXXXXX)';
  return null;
}

export function validateOtp(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'OTP is required';
  if (!/^\d{4,8}$/.test(trimmed)) return 'Enter a valid OTP code';
  return null;
}

export function validateRegisterContact(
  email: string,
  phone: string
): string | null {
  const emailError = validateEmail(email, false);
  const phoneError = validateIndianPhone(phone, false);

  if (!email.trim() && !phone.trim()) {
    return 'Email or phone number is required';
  }
  if (email.trim() && emailError) return emailError;
  if (phone.trim() && phoneError) return phoneError;
  return null;
}
