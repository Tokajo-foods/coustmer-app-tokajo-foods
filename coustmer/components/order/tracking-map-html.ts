import type { RouteLeg } from '@/lib/delivery/rider-fix';

export function buildTrackingMapHtml(opts: {
  restLat: number;
  restLng: number;
  custLat: number;
  custLng: number;
  restName: string;
  apiKey: string;
  leg: RouteLeg;
  riderIcon: string;
  restaurantIcon: string;
  homeIcon: string;
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
    const ICONS = {
      rider: ${JSON.stringify(opts.riderIcon)},
      restaurant: ${JSON.stringify(opts.restaurantIcon)},
      home: ${JSON.stringify(opts.homeIcon)}
    };
    function loadImage(src) {
      return new Promise(function(resolve, reject) {
        const img = new Image();
        img.onload = function() { resolve(img); };
        img.onerror = function() { reject(new Error('marker')); };
        img.src = src;
      });
    }
    window.gm_authFailure = function() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_ERROR' }));
      }
    };
    function initMap() {
      const rest = { lat: ${opts.restLat}, lng: ${opts.restLng} };
      const home = { lat: ${opts.custLat}, lng: ${opts.custLng} };
      Promise.all([
        loadImage(ICONS.rider),
        loadImage(ICONS.restaurant),
        loadImage(ICONS.home)
      ]).then(function(images) {
        start(images[0], images[1], images[2], rest, home);
      }).catch(function() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_ERROR' }));
        }
      });
    }
    function start(riderImg, restImg, homeImg, rest, home) {
      const map = new google.maps.Map(document.getElementById('map'), {
        center: home,
        zoom: 15,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        clickableIcons: false,
        keyboardShortcuts: false
      });
      function pinIcon(img, width, height, tip) {
        return {
          url: img.src,
          scaledSize: new google.maps.Size(width, height),
          anchor: new google.maps.Point(width / 2, height * tip)
        };
      }
      new google.maps.Marker({
        position: rest, map: map, zIndex: 2, title: '${safeName}',
        icon: pinIcon(restImg, 52, 68, 0.98)
      });
      new google.maps.Marker({
        position: home, map: map, zIndex: 3, title: 'Home',
        icon: pinIcon(homeImg, 54, 70, 0.8)
      });
      const directions = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: { strokeColor: '#FF6A00', strokeOpacity: 0.96, strokeWeight: 6 }
      });
      let fallback = null;
      let riderMarker = null;
      let frame = 0;
      let lastRoute = null;
      let fitted = false;
      let leg = ${JSON.stringify(opts.leg)};
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
      function target() { return leg === 'home' ? home : rest; }
      function fit(extra) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(rest);
        bounds.extend(home);
        if (extra) bounds.extend(extra);
        map.fitBounds(bounds, { top: 108, bottom: 56, left: 40, right: 40 });
        fitted = true;
      }
      function clearFallback() {
        if (fallback) { fallback.setMap(null); fallback = null; }
      }
      function drawFallback(origin) {
        clearFallback();
        fallback = new google.maps.Polyline({
          map: map,
          path: [origin, target()],
          strokeColor: '#FF6A00',
          strokeOpacity: 0.95,
          strokeWeight: 5
        });
      }
      function riderIcon(turn) {
        const size = 180;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.translate(size / 2, size / 2);
        ctx.rotate(((turn - 90) * Math.PI) / 180);
        const dw = 156;
        const dh = dw * (riderImg.height / riderImg.width);
        ctx.drawImage(riderImg, -dw / 2, -dh / 2 + 6, dw, dh);
        return {
          url: canvas.toDataURL('image/png'),
          scaledSize: new google.maps.Size(78, 78),
          anchor: new google.maps.Point(39, 44)
        };
      }
      function drawRoute(origin, refit) {
        const dest = target();
        directions.route({
          origin: origin,
          destination: dest,
          travelMode: google.maps.TravelMode.DRIVING
        }, function(result, status) {
          if (status !== 'OK' || !result.routes[0]) {
            drawFallback(origin);
            if (refit || !fitted) fit(origin);
            return;
          }
          clearFallback();
          renderer.setDirections(result);
          const routeLeg = result.routes[0].legs[0];
          if (window.ReactNativeWebView && routeLeg) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ROUTE_INFO',
              distance: routeLeg.distance.text,
              duration: routeLeg.duration.text
            }));
          }
          if (refit || !fitted) fit(origin);
        });
      }
      function placeRider(next, turn) {
        const drawn = riderIcon(turn);
        if (!riderMarker) {
          riderMarker = new google.maps.Marker({
            position: next, map: map, zIndex: 999, icon: drawn, optimized: false
          });
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
          riderMarker.setPosition({
            lat: from.lat + (next.lat - from.lat) * e,
            lng: from.lng + (next.lng - from.lng) * e
          });
          if (p < 1) frame = requestAnimationFrame(step);
        }
        frame = requestAnimationFrame(step);
      }
      window.__setLeg = function(next) {
        if (next !== 'home' && next !== 'restaurant') return;
        if (next === leg) return;
        leg = next;
        lastRoute = null;
        fitted = false;
        if (!riderMarker) { fit(); return; }
        const pos = riderMarker.getPosition();
        drawRoute({ lat: pos.lat(), lng: pos.lng() }, true);
      };
      window.__clearRider = function() {
        if (riderMarker) { riderMarker.setMap(null); riderMarker = null; }
        lastRoute = null;
        clearFallback();
        renderer.set('directions', null);
        fit();
      };
      window.__setRider = function(lat, lng, heading) {
        const next = { lat: Number(lat), lng: Number(lng) };
        if (!Number.isFinite(next.lat) || !Number.isFinite(next.lng)) return;
        const previous = riderMarker
          ? { lat: riderMarker.getPosition().lat(), lng: riderMarker.getPosition().lng() }
          : null;
        const turn = Number.isFinite(Number(heading)) && Number(heading) >= 0
          ? Number(heading)
          : (previous ? bearing(previous, next) : 90);
        placeRider(next, turn);
        if (!lastRoute || meters(lastRoute, next) > 35) {
          lastRoute = next;
          drawRoute(next, !fitted);
        }
      };
      fit();
      window.__mapReady = true;
    }
  </script>
  <script async defer src="https://maps.googleapis.com/maps/api/js?key=${opts.apiKey}&callback=initMap"></script>
</body>
</html>`;
}
