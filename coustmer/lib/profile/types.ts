export type UserProfile = {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string;
  language?: string;
  role?: string;
  profilePhotoUrl?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  gender?: string;
  language?: string;
  dateOfBirth?: string;
};

export type DeleteAccountPayload = {
  reason: string;
};

export type NotificationPreferences = {
  pushNotifications?: boolean;
  smsAlerts?: boolean;
  emailNotifications?: boolean;
  whatsapp?: boolean;
  orderUpdates?: boolean;
  offers?: boolean;
  cartReminders?: boolean;
  weeklyDigest?: boolean;
};

export type DietaryPreferences = {
  vegetarian?: boolean;
  vegan?: boolean;
  jain?: boolean;
  glutenFree?: boolean;
  allergies?: string[];
  spicePreference?: 'mild' | 'medium' | 'hot' | string;
};

export type UserPreferences = {
  notificationPreferences: NotificationPreferences;
  dietaryPreferences: DietaryPreferences;
};

export type LanguagePreferencePayload = {
  language: string;
};

export type UpdatePhonePayload = {
  phone: string;
};

export type UpdateEmailPayload = {
  email: string;
};

export type WalletSummary = {
  balance: number;
  currency: string;
  isLocked: boolean;
  lastCredited?: string;
};

export type WalletTransaction = {
  id?: string;
  type?: string;
  amount?: number;
  description?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type WalletTransactionsResponse = {
  data: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AddWalletPayload = {
  amount: number;
};

export type UserSession = {
  id: string;
  deviceName?: string;
  deviceType?: string;
  ipAddress?: string;
  lastActive?: string;
  isCurrent?: boolean;
  [key: string]: unknown;
};

export type UserDevice = {
  id: string;
  deviceId: string;
  deviceType: string;
  deviceName?: string;
  platform?: string;
  lastSeen?: string;
  [key: string]: unknown;
};

export type RegisterDevicePayload = {
  deviceId: string;
  deviceType: string;
  deviceName?: string;
  deviceToken?: string;
};

export type ReferralInfo = {
  referralCode: string;
  referralCount: number;
  hasApplied?: boolean;
  referredBy?: string;
  program?: {
    isActive: boolean;
    referrerBonusInr: number;
    refereeBonusInr: number;
  };
};

export type ApplyReferralPayload = {
  code: string;
};
