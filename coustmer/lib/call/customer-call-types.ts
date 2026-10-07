export type CustomerCallPhase = 'idle' | 'ringing' | 'active';

export type CustomerCallState = {
  phase: CustomerCallPhase;
  orderId: string;
  callId: string;
  callerRole: string;
  callerName: string;
  callerLogoUrl: string | null;
};

export type CustomerCallPending = {
  orderId: string;
  callerRole: string;
  callerName: string;
  callerLogoUrl: string | null;
};

export type CustomerRingMeta = {
  orderId: string;
  callId: string;
  callerRole: string;
  callerName?: string | null;
  callerLogoUrl?: string | null;
};
