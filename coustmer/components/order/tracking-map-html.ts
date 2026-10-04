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
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
    body { background: #e8eaed; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function initMap() {
      const rest = { lat: ${opts.restLat}, lng: ${opts.restLng} };
      const cust = { lat: ${opts.custLat}, lng: ${opts.custLng} };
      const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: { lat: (rest.lat + cust.lat) / 2, lng: (rest.lng + cust.lng) / 2 },
        disableDefaultUI: true,
        gestureHandling: 'none',
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#f1f3f4' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbeafe' }] }
        ]
      });
      function pin(color) {
        return {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48"><path d="M18 0C8.06 0 0 8.06 0 18c0 12.75 18 30 18 30s18-17.25 18-30C36 8.06 27.94 0 18 0z" fill="' + color + '"/><circle cx="18" cy="18" r="7.5" fill="#fff"/></svg>'
          ),
          scaledSize: new google.maps.Size(36, 48),
          anchor: new google.maps.Point(18, 46)
        };
      }
      new google.maps.Marker({ position: rest, map: map, icon: pin('#111827'), label: { text: '${safeName}', color: '#111827', fontSize: '11px', fontWeight: '700' } });
      new google.maps.Marker({ position: cust, map: map, icon: pin('#FF6A00'), label: { text: 'You', color: '#111827', fontSize: '11px', fontWeight: '700' } });
      const riderIcon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="16" fill="#FF6A00"/><text x="26" y="31" font-size="14" text-anchor="middle">🛵</text></svg>'),
        scaledSize: new google.maps.Size(52, 52),
        anchor: new google.maps.Point(26, 26)
      };
      let riderMarker = null;
      let frame = 0;
      window.__clearRider = function() {
        if (riderMarker) { riderMarker.setMap(null); riderMarker = null; }
      };
      window.__setRider = function(lat, lng) {
        const next = { lat: Number(lat), lng: Number(lng) };
        if (!riderMarker) {
          riderMarker = new google.maps.Marker({ position: next, map: map, zIndex: 999, icon: riderIcon });
          return;
        }
        const start = riderMarker.getPosition();
        const from = { lat: start.lat(), lng: start.lng() };
        const t0 = performance.now();
        if (frame) cancelAnimationFrame(frame);
        function step(now) {
          const p = Math.min(1, (now - t0) / 800);
          const e = p * p * (3 - 2 * p);
          riderMarker.setPosition({ lat: from.lat + (next.lat - from.lat) * e, lng: from.lng + (next.lng - from.lng) * e });
          if (p < 1) frame = requestAnimationFrame(step);
        }
        frame = requestAnimationFrame(step);
      };
      const directions = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: { strokeColor: '#FF6A00', strokeOpacity: 0.95, strokeWeight: 5 }
      });
      directions.route({ origin: rest, destination: cust, travelMode: google.maps.TravelMode.DRIVING }, function(result, status) {
        if (status === 'OK' && result.routes[0]) {
          renderer.setDirections(result);
          const leg = result.routes[0].legs[0];
          if (window.ReactNativeWebView && leg) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ROUTE_INFO', distance: leg.distance.text, duration: leg.duration.text }));
          }
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(rest);
          bounds.extend(cust);
          map.fitBounds(bounds, { top: 100, bottom: 48, left: 48, right: 48 });
        }
      });
      window.__mapReady = true;
    }
  </script>
  <script async defer src="https://maps.googleapis.com/maps/api/js?key=${opts.apiKey}&callback=initMap"></script>
</body>
</html>`;
}
