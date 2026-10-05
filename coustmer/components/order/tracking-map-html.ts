const HOME_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">' +
  '<path d="M24 4 L44 20 H38 V44 H10 V20 H4 Z" fill="#FF6A00"/>' +
  '<path d="M20 44 V30 H28 V44 Z" fill="#fff"/>' +
  '<circle cx="24" cy="22" r="3" fill="#fff"/>' +
  '</svg>';

const STORE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
  '<rect x="6" y="16" width="28" height="18" rx="2" fill="#111827"/>' +
  '<path d="M4 16 L8 8 H32 L36 16 Z" fill="#FF6A00"/>' +
  '<rect x="16" y="22" width="8" height="12" fill="#fff"/>' +
  '</svg>';

const RIDER_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
  '<g transform="rotate(__TURN__ 32 32)">' +
  '<circle cx="32" cy="32" r="28" fill="#fff" stroke="#FF6A00" stroke-width="3"/>' +
  '<circle cx="20" cy="40" r="5" fill="#111827"/>' +
  '<circle cx="44" cy="40" r="5" fill="#111827"/>' +
  '<path d="M16 38 H24 L30 28 H42 L48 38" fill="none" stroke="#FF6A00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<circle cx="36" cy="20" r="5" fill="#111827"/>' +
  '<path d="M36 25 V32" stroke="#111827" stroke-width="2" stroke-linecap="round"/>' +
  '</g></svg>';

export function buildTrackingMapHtml(opts: {
  restLat: number;
  restLng: number;
  custLat: number;
  custLng: number;
  restName: string;
  apiKey: string;
}): string {
  const safeName = opts.restName.replace(/[<'\\]/g, '');
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; } body { background: #e8eaed; }</style>
</head>
<body>
  <div id="map"></div>
  <script>
    function initMap() {
      const rest = { lat: ${opts.restLat}, lng: ${opts.restLng} };
      const home = { lat: ${opts.custLat}, lng: ${opts.custLng} };
      const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: home,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#f1f3f4' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbeafe' }] }
        ]
      });
      function icon(svg, w, h, ax, ay) {
        return {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
          scaledSize: new google.maps.Size(w, h),
          anchor: new google.maps.Point(ax, ay)
        };
      }
      new google.maps.Marker({ position: rest, map: map, zIndex: 2, icon: icon(${JSON.stringify(STORE_SVG)}, 40, 40, 20, 36), title: '${safeName}' });
      new google.maps.Marker({ position: home, map: map, zIndex: 3, icon: icon(${JSON.stringify(HOME_SVG)}, 48, 48, 24, 44), title: 'Home' });
      const directions = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: { strokeColor: '#FF6A00', strokeOpacity: 0.95, strokeWeight: 5 }
      });
      let riderMarker = null;
      let frame = 0;
      let lastRoute = null;
      let fitted = false;
      function meters(a, b) {
        const r = Math.PI / 180;
        const dLat = (b.lat - a.lat) * r;
        const dLng = (b.lng - a.lng) * r;
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
        return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
      }
      function bearing(a, b) {
        const r = Math.PI / 180;
        const y = Math.sin((b.lng - a.lng) * r) * Math.cos(b.lat * r);
        const x = Math.cos(a.lat * r) * Math.sin(b.lat * r) - Math.sin(a.lat * r) * Math.cos(b.lat * r) * Math.cos((b.lng - a.lng) * r);
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      }
      function drawRoute(origin, fit) {
        directions.route({ origin: origin, destination: home, travelMode: google.maps.TravelMode.DRIVING }, function(result, status) {
          if (status !== 'OK' || !result.routes[0]) return;
          renderer.setDirections(result);
          const leg = result.routes[0].legs[0];
          if (window.ReactNativeWebView && leg) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ROUTE_INFO', distance: leg.distance.text, duration: leg.duration.text }));
          }
          if (fit || !fitted) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(origin);
            bounds.extend(home);
            bounds.extend(rest);
            map.fitBounds(bounds, { top: 80, bottom: 48, left: 40, right: 40 });
            fitted = true;
          }
        });
      }
      function placeRider(next, turn) {
        const svg = ${JSON.stringify(RIDER_SVG)}.replace('__TURN__', String(Math.round(turn)));
        const drawn = icon(svg, 64, 64, 32, 32);
        if (!riderMarker) {
          riderMarker = new google.maps.Marker({ position: next, map: map, zIndex: 999, icon: drawn });
          return;
        }
        riderMarker.setIcon(drawn);
        const start = riderMarker.getPosition();
        const from = { lat: start.lat(), lng: start.lng() };
        const t0 = performance.now();
        if (frame) cancelAnimationFrame(frame);
        function step(now) {
          const p = Math.min(1, (now - t0) / 1000);
          const e = p * p * (3 - 2 * p);
          riderMarker.setPosition({ lat: from.lat + (next.lat - from.lat) * e, lng: from.lng + (next.lng - from.lng) * e });
          if (p < 1) frame = requestAnimationFrame(step);
        }
        frame = requestAnimationFrame(step);
      }
      window.__clearRider = function() {
        if (riderMarker) { riderMarker.setMap(null); riderMarker = null; }
        lastRoute = null;
        drawRoute(rest, true);
      };
      window.__setRider = function(lat, lng, heading) {
        const next = { lat: Number(lat), lng: Number(lng) };
        if (!Number.isFinite(next.lat) || !Number.isFinite(next.lng)) return;
        const previous = riderMarker ? { lat: riderMarker.getPosition().lat(), lng: riderMarker.getPosition().lng() } : null;
        const turn = Number.isFinite(Number(heading)) && Number(heading) >= 0
          ? Number(heading)
          : (previous ? bearing(previous, next) : 0);
        placeRider(next, turn);
        if (!lastRoute || meters(lastRoute, next) > 35) {
          lastRoute = next;
          drawRoute(next, !fitted);
        }
      };
      drawRoute(rest, true);
      window.__mapReady = true;
    }
  </script>
  <script async defer src="https://maps.googleapis.com/maps/api/js?key=${opts.apiKey}&callback=initMap"></script>
</body>
</html>`;
}
