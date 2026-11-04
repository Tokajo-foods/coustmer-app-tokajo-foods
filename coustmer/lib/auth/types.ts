export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  /** user-service role, e.g. customer | delivery_partner | restaurant_owner */
  role?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
  message?: string;
};

export type LoginPayload = {
  password: string;
  email?: string;
  phone?: string;
};

export type OtpPurpose = 'login' | 'register' | 'verification' | 'forgot_password';

export type OtpSendPayload = {
  emailOrPhone: string;
  purpose?: OtpPurpose;
};

export type OtpVerifyPayload = {
  emailOrPhone: string;
  otp: string;
  purpose?: OtpPurpose;
};

/** Emailed reset link (`token`) or an identifier whose forgot_password OTP was confirmed. */
export type ResetPasswordPayload = {
  token?: string;
  identifier?: string;
  password: string;
  confirmPassword?: string;
};

export type MessageResponse = {
  message: string;
};

/** `GET /auth/phone/status`. */
export type PhoneAuthStatus = {
  firebaseConfigured: boolean;
  provider: string;
  otpLength: number;
  resendCooldownSeconds: number;
  tokenMaxAgeSeconds: number;
};

/** Verified Firebase phone + ID token for `/auth/phone/*`. */
export type PhoneLoginPayload = {
  idToken: string;
  phone?: string;
};

export type PhoneRegisterPayload = {
  idToken: string;
  phone: string;
  firstName: string;
  lastName?: string;
  email?: string;
  password?: string;
  referralCode?: string;
};

export type PhoneForgotPasswordResult = {
  resetToken: string;
  expiresInSeconds: number;
  /** Masked, e.g. +91******3210 */
  phone: string;
};

export type PhoneCheckPurpose = 'login' | 'register' | 'forgot_password';

/** `POST /auth/phone/check` — the number may receive an OTP for this purpose. */
export type PhoneCheckResult = {
  phone: string;
  maskedPhone: string;
  exists: boolean;
  linkExistingAccount: boolean;
};

/** `POST /auth/password/change/start`. */
export type PasswordChangeStart = {
  emailRequired: boolean;
  phoneRequired: boolean;
  maskedEmail: string | null;
  phone: string | null;
  maskedPhone: string | null;
  emailOtpSent: boolean;
  cooldownSeconds: number;
};

/** Normalize role strings from user-service. */
export function normalizeUserRole(role: unknown): string {
  return String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

/**
 * Customer app only. Partner accounts (delivery / restaurant / admin)
 * must use their own apps.
 */
export function isPartnerRole(role: unknown): boolean {
  const r = normalizeUserRole(role);
  if (!r) return false;
  if (r === 'customer' || r === 'user' || r === 'consumer') return false;
  return (
    r.includes('delivery') ||
    r.includes('rider') ||
    r.includes('driver') ||
    r.includes('restaurant') ||
    r.includes('vendor') ||
    r.includes('merchant') ||
    r.includes('owner') ||
    r === 'admin' ||
    r === 'partner'
  );
}

export function assertCustomerAccount(role: unknown): void {
  if (!isPartnerRole(role)) return;
  // Don't reveal that a partner account exists — treat as unknown user.
  throw new Error('User not found');
}
