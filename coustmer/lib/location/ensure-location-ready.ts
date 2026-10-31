import * as Location from 'expo-location';
import { AppState, Platform } from 'react-native';

export type LocationReadiness = 'ready' | 'off' | 'denied' | 'blocked';

const PERMISSION_WAIT_MS = 60_000;
const SERVICES_WAIT_MS = 30_000;
const RECHECK_DELAY_MS = 400;

type PermissionResult = { granted: boolean; canAskAgain: boolean };

/**
 * Asked from inside a Modal, Android can drop the permission result so the promise never settles.
 * Re-read the permission when the app returns from the system dialog and take whichever answers first.
 */
function requestPermission(): Promise<PermissionResult> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: PermissionResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      sub.remove();
      resolve(result);
    };
    const read = (p: Location.LocationPermissionResponse) => ({
      granted: p.status === Location.PermissionStatus.GRANTED,
      canAskAgain: p.canAskAgain,
    });
    const timer = setTimeout(() => finish({ granted: false, canAskAgain: true }), PERMISSION_WAIT_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      setTimeout(() => {
        Location.getForegroundPermissionsAsync()
          .then((p) => {
            if (p.status !== Location.PermissionStatus.UNDETERMINED) finish(read(p));
          })
          .catch(() => undefined);
      }, RECHECK_DELAY_MS);
    });
    Location.requestForegroundPermissionsAsync().then(
      (p) => finish(read(p)),
      () => finish({ granted: false, canAskAgain: true }),
    );
  });
}

function withDeadline<T>(work: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

/** Permission + device location switch, each bounded so the caller never waits forever. */
export async function ensureLocationReady(): Promise<LocationReadiness> {
  const current = await Location.getForegroundPermissionsAsync();
  let perm: PermissionResult = {
    granted: current.status === Location.PermissionStatus.GRANTED,
    canAskAgain: current.canAskAgain,
  };
  if (!perm.granted && perm.canAskAgain) perm = await requestPermission();
  if (!perm.granted) return perm.canAskAgain ? 'denied' : 'blocked';

  let servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn && Platform.OS === 'android') {
    await withDeadline(Location.enableNetworkProviderAsync(), SERVICES_WAIT_MS, undefined);
    servicesOn = await Location.hasServicesEnabledAsync().catch(() => false);
  }
  return servicesOn ? 'ready' : 'off';
}
