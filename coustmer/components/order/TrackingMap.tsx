import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { GoogleMapsErrorView } from '@/components/location/GoogleMapsErrorView';
import { buildTrackingMapHtml } from '@/components/order/tracking-map-html';
import { HOME_MARKER, RESTAURANT_MARKER, RIDER_MARKER } from '@/components/order/tracking-marker-icons';
import { fixAgeMs, type RiderPoint, type RouteLeg } from '@/lib/delivery/rider-fix';
import { GOOGLE_MAPS_API_KEY, isGoogleMapsConfigured } from '@/lib/google-maps';

type Props = {
  restLat: number | null;
  restLng: number | null;
  custLat: number | null;
  custLng: number | null;
  restName: string;
  rider: RiderPoint | null;
  stale: boolean;
  leg: RouteLeg;
  onRoute?: (info: { dist: string; time: string }) => void;
};

/** Restaurant and home pins stay put. The rider marker slides in the page. */
export function TrackingMap({
  restLat,
  restLng,
  custLat,
  custLng,
  restName,
  rider,
  stale,
  leg,
  onRoute,
}: Props) {
  const webRef = useRef<WebView>(null);
  const ready = useRef(false);
  const startLeg = useRef(leg);
  const htmlBuilt = useRef(false);
  if (!htmlBuilt.current) startLeg.current = leg;
  const pinsReady = restLat != null && restLng != null && custLat != null && custLng != null;

  const html = useMemo(() => {
    if (restLat == null || restLng == null || custLat == null || custLng == null) return '';
    htmlBuilt.current = true;
    return buildTrackingMapHtml({
      restLat,
      restLng,
      custLat,
      custLng,
      restName,
      apiKey: GOOGLE_MAPS_API_KEY,
      leg: startLeg.current,
      riderIcon: RIDER_MARKER,
      restaurantIcon: RESTAURANT_MARKER,
      homeIcon: HOME_MARKER,
    });
  }, [restLat, restLng, custLat, custLng, restName]);

  const pushRider = (point: RiderPoint | null) => {
    const heading = point?.heading != null && Number.isFinite(point.heading) && point.heading >= 0
      ? point.heading
      : 'null';
    const js = point
      ? `window.__setRider && window.__setRider(${point.lat}, ${point.lng}, ${heading}); true;`
      : 'window.__clearRider && window.__clearRider(); true;';
    webRef.current?.injectJavaScript(js);
  };

  const lat = rider?.lat;
  const lng = rider?.lng;
  const heading = rider?.heading;
  useEffect(() => {
    if (!ready.current) return;
    pushRider(lat == null || lng == null ? null : { lat, lng, heading });
  }, [lat, lng, heading]);

  useEffect(() => {
    if (!ready.current) return;
    webRef.current?.injectJavaScript(
      `window.__setLeg && window.__setLeg(${JSON.stringify(leg)}); true;`,
    );
  }, [leg]);

  if (!isGoogleMapsConfigured()) return <GoogleMapsErrorView />;
  if (!pinsReady || !html) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Map opens when the restaurant and your selected address are ready.</Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <WebView
        ref={webRef}
        style={styles.fill}
        source={{ html, baseUrl: 'https://maps.googleapis.com' }}
        originWhitelist={['*']}
        onLoadEnd={() => {
          ready.current = true;
          webRef.current?.injectJavaScript(
            `window.__setLeg && window.__setLeg(${JSON.stringify(leg)}); true;`,
          );
          pushRider(rider);
        }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data) as { type?: string; distance?: string; duration?: string };
            if (data.type === 'ROUTE_INFO' && data.distance && data.duration) {
              onRoute?.({ dist: data.distance, time: data.duration });
            }
          } catch {
            // ignore
          }
        }}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        domStorageEnabled
      />
      {stale ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{staleCopy(rider?.updatedAt)}</Text>
        </View>
      ) : null}
    </View>
  );
}

function staleCopy(updatedAt: string | undefined): string {
  const age = fixAgeMs(updatedAt);
  if (age == null) return 'Updating rider location';
  const seconds = Math.round(age / 1000);
  if (seconds < 60) return `Rider location is ${seconds}s old`;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `Rider location is ${minutes} min old`;
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#e8eaed' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#e8eaed' },
  emptyText: { color: '#111827', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bannerText: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
