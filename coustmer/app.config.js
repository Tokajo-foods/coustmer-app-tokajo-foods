const fs = require('fs');
const path = require('path');

// Android push (Expo + FCM) needs the Firebase Android app config. EAS: file secret GOOGLE_SERVICES_JSON.
const googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON?.trim() ||
  (fs.existsSync(path.join(__dirname, 'google-services.json')) ? './google-services.json' : undefined);
const mapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';
const apiUrl =
  process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://api.tokajofoods.com';
const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() || '';
const firebaseAuthDomain =
  process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || '';
const firebaseProjectId =
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() || '';
const firebaseAppId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() || '';
const firebaseMessagingSenderId =
  process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || '';
const firebaseStorageBucket =
  process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || '';
/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: 'TOKAJO FOODS',
  slug: 'Food-Delivery-App',
  version: '1.0.1',
  scheme: 'fooddeliveryapp',
  orientation: 'portrait',
  icon: './assets/tokajo-customer-icon.png',
  userInterfaceStyle: 'automatic',
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#FFFFFF',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow TOKAJO FOODS to access your location to set your delivery address and find restaurants near you.',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          minSdkVersion: 24,
          usesCleartextTraffic: true,
        },
      },
    ],
    './plugins/with-native-firebase.js',
    '@react-native-community/datetimepicker',
    './withMinSdkVersion.js',
    './plugins/with-eas-autolinking-cache.js',
    './plugins/with-razorpay-upi.js',
    ['@livekit/react-native-expo-plugin', { android: { audioType: 'communication' } }],
    '@config-plugins/react-native-webrtc',
    'expo-audio',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#F97316',
        sounds: ['./assets/sounds/incoming_call.wav'],
        mode: 'production',
      },
    ],
    [
      '@config-plugins/react-native-callkeep',
      {
        ios: {
          appName: 'TOKAJO FOODS',
          supportsVideo: false,
          includesCallsInRecents: false,
        },
      },
    ],
    './plugins/with-call-native.js',
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.tokajofoods.customer',
    entitlements: {
      'com.apple.developer.usernotifications.time-sensitive': true,
    },
    config: {
      googleMapsApiKey: mapsKey,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Allow TOKAJO FOODS to access your location to set your delivery address and find restaurants near you.',
      NSMicrophoneUsageDescription:
        'Allow TOKAJO FOODS to use the microphone for in-app calls on an order. Your mobile number stays hidden.',
      UIBackgroundModes: ['audio', 'voip', 'remote-notification', 'fetch'],
      // Razorpay UPI intent — lets checkout detect and open installed UPI apps.
      LSApplicationQueriesSchemes: ['tez', 'phonepe', 'paytmmp', 'credpay', 'bhim', 'upi'],
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
  },
  android: {
    package: 'com.tokajofoods.customer',
    ...(googleServicesFile ? { googleServicesFile } : {}),
    softwareKeyboardLayoutMode: 'resize',
    adaptiveIcon: {
      foregroundImage: './assets/tokajo-customer-adaptive.png',
      monochromeImage: './assets/tokajo-customer-monochrome.png',
      backgroundColor: '#F9C008',
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.WAKE_LOCK',
      'android.permission.USE_FULL_SCREEN_INTENT',
      'android.permission.MANAGE_OWN_CALLS',
      'android.permission.READ_PHONE_STATE',
      'android.permission.CALL_PHONE',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_PHONE_CALL',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.VIBRATE',
    ],
    // Template/library-added permissions the app never uses: no alarm-triggered notifications, no shared-storage
    // writes, and overlay access is never requested from the user (declaring it alone grants nothing).
    blockedPermissions: [
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
    config: {
      googleMaps: {
        apiKey: mapsKey,
      },
    },
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: 'f7fa7a0f-c673-4c5c-9180-d80fd28e41c0',
    },
    apiUrl,
    googleMapsApiKey: mapsKey,
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseAppId,
    firebaseMessagingSenderId,
    firebaseStorageBucket,
  },
};

module.exports = config;
