import { asRecord, DS, get } from '@/lib/delivery/http';
import type { City, SurgeStatus, Zone, ZoneDetail } from '@/lib/delivery/types';

export const zonesApi = {
  /** GET /public/cities — launch city list */
  getCities: async (): Promise<City[]> => {
    const raw = await get<unknown>(`${DS}/public/cities`);
    const list = Array.isArray(raw) ? raw : Array.isArray(asRecord(raw).cities) ? asRecord(raw).cities as unknown[] : [];
    return (list as unknown[]).map((c) => {
      const r = asRecord(c);
      const hoursRaw = asRecord(r.hours);
      const zonesRaw = Array.isArray(r.zones) ? r.zones : [];
      return {
        id: String(r.id ?? r._id ?? r.name ?? ''),
        name: String(r.name ?? r.city ?? ''),
        slug: (r.slug as string) || undefined,
        lat: typeof r.lat === 'number' ? r.lat : undefined,
        lng: typeof r.lng === 'number' ? r.lng : undefined,
        polygon: Array.isArray(r.polygon) ? (r.polygon as number[][][]) : null,
        hours:
          typeof hoursRaw.open === 'string' && typeof hoursRaw.close === 'string'
            ? {
                open: hoursRaw.open,
                close: hoursRaw.close,
                tz: typeof hoursRaw.tz === 'string' ? hoursRaw.tz : undefined,
              }
            : undefined,
        zones: zonesRaw.map((z) => {
          const row = asRecord(z);
          return {
            zoneId: String(row.zoneId ?? row.id ?? row._id ?? ''),
            name: String(row.name ?? ''),
            isActive: row.isActive !== false,
            surgeMultiplier:
              typeof row.surgeMultiplier === 'number' ? row.surgeMultiplier : undefined,
            polygon: Array.isArray(row.polygon) ? (row.polygon as number[][][]) : undefined,
          };
        }),
        isActive: r.isLive !== false && r.isActive !== false,
        isLive: r.isLive !== false,
      };
    });
  },

  /** GET /zones */
  getZones: async (): Promise<Zone[]> => {
    const raw = await get<unknown>(`${DS}/zones`);
    const list = Array.isArray(raw) ? raw : Array.isArray(asRecord(raw).zones) ? asRecord(raw).zones as unknown[] : [];
    return (list as unknown[]).map((z) => {
      const r = asRecord(z);
      return {
        id: String(r._id ?? r.id ?? ''),
        name: String(r.name ?? ''),
        cityId: (r.cityId as string) || undefined,
        isActive: r.isActive !== undefined ? Boolean(r.isActive) : true,
      };
    });
  },

  /** GET /zones/:zoneId */
  getZone: async (zoneId: string): Promise<ZoneDetail> => {
    const raw = await get<unknown>(`${DS}/zones/${zoneId}`);
    const r = asRecord(raw);
    const polygon = Array.isArray(r.polygon) ? (r.polygon as [number, number][]) : undefined;
    const center = asRecord(r.center ?? r.centerPoint ?? {});
    return {
      id: String(r._id ?? r.id ?? zoneId),
      name: String(r.name ?? ''),
      cityId: (r.cityId as string) || undefined,
      isActive: r.isActive !== undefined ? Boolean(r.isActive) : true,
      polygon,
      centerLat: typeof center.lat === 'number' ? center.lat : typeof r.centerLat === 'number' ? r.centerLat : undefined,
      centerLng: typeof center.lng === 'number' ? center.lng : typeof r.centerLng === 'number' ? r.centerLng : undefined,
      radiusKm: typeof r.radiusKm === 'number' ? r.radiusKm : undefined,
      openTime: (r.openTime as string) || (r.opens as string) || undefined,
      closeTime: (r.closeTime as string) || (r.closes as string) || undefined,
      description: (r.description as string) || undefined,
    };
  },

  /** GET /zones/:zoneId/surge-status */
  getSurgeStatus: async (zoneId: string): Promise<SurgeStatus> => {
    const raw = await get<unknown>(`${DS}/zones/${zoneId}/surge-status`);
    const r = asRecord(raw);
    return {
      zoneId,
      isSurge: Boolean(r.isSurge ?? r.surge ?? false),
      multiplier: typeof r.multiplier === 'number' ? r.multiplier : undefined,
      label: (r.label as string) || undefined,
    };
  },
};
