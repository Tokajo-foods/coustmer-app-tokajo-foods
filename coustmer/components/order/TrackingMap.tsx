import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { GoogleMapsErrorView } from '@/components/location/GoogleMapsErrorView';
import { buildTrackingMapHtml } from '@/components/order/tracking-map-html';
import { fixAgeMs, type RiderPoint } from '@/lib/delivery/rider-fix';
import { GOOGLE_MAPS_API_KEY, isGoogleMapsConfigured } from '@/lib/google-maps';

type Props = {
  restLat: number;
  restLng: number;
  custLat: number;
  custLng: number;
  restName: string;
  rider: RiderPoint | null;
  stale: boolean;
  onRoute?: (info: { dist: string; time: string }) => void;
};

/** Restaurant and drop stay put. The rider marker moves in the page, without a reload. */
export function TrackingMap({
  restLat,
  restLng,
  custLat,
  custLng,
  restName,
  rider,
  stale,
  onRoute,
}: Props) {
  const webRef = useRef<WebView>(null);
  const ready = useRef(false);
  const html = useMemo(
    () => buildTrackingMapHtml({
      restLat,
      restLng,
      custLat,
      custLng,
      restName,
      apiKey: GOOGLE_MAPS_API_KEY,
    }),
    [restLat, restLng, custLat, custLng, restName],
  );

  const pushRider = (point: RiderPoint | null) => {
    const js = point
      ? `window.__setRider && window.__setRider(${point.lat}, ${point.lng}); true;`
      : 'window.__clearRider && window.__clearRider(); true;';
    webRef.current?.injectJavaScript(js);
  };

  const lat = rider?.lat;
  const lng = rider?.lng;
  useEffect(() => {
    if (!ready.current) return;
    pushRider(lat == null || lng == null ? null : { lat, lng });
  }, [lat, lng]);

  if (!isGoogleMapsConfigured()) return <GoogleMapsErrorView />;

  return (
    <View style={styles.fill}>
      <WebView
        ref={webRef}
        style={styles.fill}
        source={{ html, baseUrl: 'https://maps.googleapis.com' }}
        originWhitelist={['*']}
        onLoadEnd={() => {
          ready.current = true;
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
  fill: { flex: 1 },
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
