/**
 * Delivery Service — all customer-facing APIs.
 * Gateway prefix: /api/v1/delivery-service
 *
 * §10 CUSTOMER_APP_ALL_APIS.md.
 */

import { asRecord, DS, errorCode, errorStatus, get, mutate, TRACKING } from '@/lib/delivery/http';
import {
  mapChat,
  mapDeliveryPartner,
  mapLiveLocation,
  mapPublicShare,
  mapTracker,
} from '@/lib/delivery/mappers';
import { zonesApi } from '@/lib/delivery/zones-api';
import type {
  AddressChangePayload,
  ChatMessage,
  ContactlessPayload,
  DeliveryInstructionsPayload,
  DeliveryPartner,
  DropOtp,
  LiveLocation,
  OrderTracker,
  PublicShareTracking,
  RatePartnerPayload,
  SendChatPayload,
  ShareLink,
  TrackingEta,
  TrackingRoute,
  TrackingSupportReason,
  TrackingTipPayload,
} from '@/lib/delivery/types';

export { mapDeliveryPartner } from '@/lib/delivery/mappers';

/** Location is simply not available (no rider fix yet, or trip outside the share window). */
function isNoLocation(err: unknown): boolean {
  const code = errorCode(err);
  return code === 'LOCATION_NOT_FOUND' || code === 'TRACKING_NOT_ACTIVE';
}

export const deliveryApi = {
  ...zonesApi,

  /** GET /tracking/order/:orderId — full tracker DTO (status, rider GPS, ETA, pins, partner) */
  getTracking: async (orderId: string): Promise<OrderTracker> => {
    const raw = await get<unknown>(`${TRACKING}/${orderId}`);
    return mapTracker(raw, orderId);
  },

  /** GET /tracking/order/:orderId/location — last rider fix, null when not shared / not yet recorded */
  getLiveLocation: async (orderId: string): Promise<LiveLocation | null> => {
    try {
      return mapLiveLocation(await get<unknown>(`${TRACKING}/${orderId}/location`));
    } catch (err) {
      if (isNoLocation(err)) return null;
      throw err;
    }
  },

  /** GET /tracking/order/:orderId/eta */
  getEta: async (orderId: string): Promise<TrackingEta> => {
    const r = asRecord(await get<unknown>(`${TRACKING}/${orderId}/eta`));
    const etaSeconds = typeof r.etaSeconds === 'number' ? r.etaSeconds : undefined;
    return {
      etaSeconds,
      etaMinutes: typeof etaSeconds === 'number' && etaSeconds > 0 ? Math.max(1, Math.round(etaSeconds / 60)) : undefined,
      etaAt: (r.etaAt as string) || undefined,
      distanceMeters: typeof r.distanceMeters === 'number' ? r.distanceMeters : undefined,
      destination:
        r.destination === 'restaurant' || r.destination === 'customer' || r.destination === 'arrived'
          ? r.destination
          : undefined,
    };
  },

  /** GET /tracking/order/:orderId/route */
  getRoute: async (orderId: string): Promise<TrackingRoute> => {
    const r = asRecord(await get<unknown>(`${TRACKING}/${orderId}/route`));
    return {
      polyline: (r.polyline as string) || undefined,
      distanceMeters: typeof r.distanceMeters === 'number' ? r.distanceMeters : undefined,
      durationSeconds: typeof r.etaSeconds === 'number' ? r.etaSeconds : undefined,
    };
  },

  /** GET /tracking/order/:orderId/partner — masked rider */
  getOrderPartner: async (orderId: string): Promise<DeliveryPartner | null> => {
    if (!orderId) return null;
    try {
      const raw = await get<unknown>(`${TRACKING}/${orderId}/partner`);
      return mapDeliveryPartner(raw);
    } catch (err) {
      const status = errorStatus(err);
      if (status === 404 || errorCode(err) === 'PARTNER_NOT_ASSIGNED') return null;
      throw err;
    }
  },

  /** GET /tracking/order/:orderId/otp — drop OTP */
  getDropOtp: async (orderId: string): Promise<DropOtp | null> => {
    try {
      const raw = await get<unknown>(`${TRACKING}/${orderId}/otp`);
      const r = asRecord(raw);
      const otp = String(r.otp ?? r.dropOtp ?? r.code ?? '');
      if (!otp) return null;
      return { otp, expiresAt: (r.expiresAt as string) || undefined };
    } catch {
      return null;
    }
  },

  /** GET /tracking/order/:orderId/chat */
  getChatHistory: async (orderId: string): Promise<ChatMessage[]> => {
    const raw = await get<unknown>(`${TRACKING}/${orderId}/chat`);
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(asRecord(raw).messages)
        ? (asRecord(raw).messages as unknown[])
        : [];
    return (list as unknown[]).map((m) => mapChat(m, orderId));
  },

  /** POST /tracking/order/:orderId/chat */
  sendChat: async (orderId: string, payload: SendChatPayload): Promise<ChatMessage> => {
    const raw = await mutate<unknown>('POST', `${TRACKING}/${orderId}/chat`, {
      text: payload.text,
      ...(payload.to ? { to: payload.to } : {}),
    });
    return mapChat(asRecord(raw), orderId);
  },

  /** POST /tracking/order/:orderId/share — family share link */
  createShareLink: async (orderId: string): Promise<ShareLink> => {
    const raw = await mutate<unknown>('POST', `${TRACKING}/${orderId}/share`, {});
    const r = asRecord(raw);
    return {
      shareToken: String(r.shareToken ?? r.token ?? ''),
      url: String(r.url ?? r.shareUrl ?? ''),
      expiresAt: (r.expiresAt as string) || undefined,
    };
  },

  /** DELETE /tracking/order/:orderId/share */
  revokeShareLink: async (orderId: string): Promise<void> => {
    await mutate<unknown>('DELETE', `${TRACKING}/${orderId}/share`);
  },

  /** GET /tracking/share/:shareToken — public live track (no auth) */
  getPublicShare: async (shareToken: string): Promise<PublicShareTracking> => {
    const raw = await get<unknown>(`${DS}/tracking/share/${encodeURIComponent(shareToken)}`);
    return mapPublicShare(raw);
  },

  /** POST /tracking/order/:orderId/nudge-partner */
  nudgePartner: async (orderId: string): Promise<void> => {
    await mutate<unknown>('POST', `${TRACKING}/${orderId}/nudge-partner`, {});
  },

  /** POST /tracking/order/:orderId/contact-partner */
  contactPartner: async (orderId: string): Promise<{ callId?: string; maskedPhone?: string }> => {
    const raw = await mutate<unknown>('POST', `${TRACKING}/${orderId}/contact-partner`, {});
    const r = asRecord(raw);
    return {
      callId: (r.callId as string) || undefined,
      maskedPhone: (r.virtualNumber as string) || (r.maskedPhone as string) || undefined,
    };
  },

  /** POST /tracking/order/:orderId/contact-support — body `{ reason, message? }` */
  contactSupport: async (
    orderId: string,
    input: { reason: TrackingSupportReason; message?: string },
  ): Promise<void> => {
    await mutate<unknown>('POST', `${TRACKING}/${orderId}/contact-support`, input);
  },

  /** PUT /tracking/order/:orderId/delivery-instructions */
  setDeliveryInstructions: async (
    orderId: string,
    payload: DeliveryInstructionsPayload
  ): Promise<void> => {
    await mutate<unknown>('PUT', `${TRACKING}/${orderId}/delivery-instructions`, payload);
  },

  /** PUT /tracking/order/:orderId/contactless — body `{ contactless }` */
  setContactless: async (orderId: string, payload: ContactlessPayload): Promise<void> => {
    await mutate<unknown>('PUT', `${TRACKING}/${orderId}/contactless`, { contactless: payload.enabled });
  },

  /** PUT /tracking/order/:orderId/address-change — pre-pickup only */
  changeAddress: async (orderId: string, payload: AddressChangePayload): Promise<void> => {
    await mutate<unknown>('PUT', `${TRACKING}/${orderId}/address-change`, {
      formattedAddress: payload.formattedAddress,
      lat: payload.lat,
      lng: payload.lng,
    });
  },

  /** POST /tracking/order/:orderId/tip — body `{ tipAmount }`, Idempotency-Key required */
  addTip: async (orderId: string, payload: TrackingTipPayload): Promise<void> => {
    const key = payload.idempotencyKey ?? `tip-${orderId}-${Date.now()}`;
    await mutate<unknown>('POST', `${TRACKING}/${orderId}/tip`, { tipAmount: payload.tip }, {
      'Idempotency-Key': key,
    });
  },

  /** POST /tracking/order/:orderId/rate-partner — body `{ stars, comment? }` */
  ratePartner: async (orderId: string, payload: RatePartnerPayload): Promise<void> => {
    await mutate<unknown>('POST', `${TRACKING}/${orderId}/rate-partner`, {
      stars: payload.rating,
      ...(payload.comment ? { comment: payload.comment } : {}),
    });
  },
};
