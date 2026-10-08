const mapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';
const apiUrl =
  process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://api.viharfood.in';
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
  icon: './assets/icon.png',
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
          'Allow Food Delivery to access your location to set your delivery address and find restaurants near you.',
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
    '@react-native-community/datetimepicker',
    './withMinSdkVersion.js',
    ['@livekit/react-native-expo-plugin', { android: { audioType: 'communication' } }],
    '@config-plugins/react-native-webrtc',
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#FF6A00',
        sounds: ['./assets/sounds/incoming_call.wav'],
        mode: 'production',
      },
    ],
    '@config-plugins/react-native-callkeep',
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.fooddeliveryapp.customer',
    config: {
      googleMapsApiKey: mapsKey,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Allow Food Delivery to access your location to set your delivery address and find restaurants near you.',
      NSMicrophoneUsageDescription:
        'Allow TOKAJO FOODS to use the microphone for in-app calls on an order. Your mobile number stays hidden.',
      UIBackgroundModes: ['audio', 'voip', 'remote-notification', 'fetch'],
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
  },
  android: {
    package: 'com.fooddeliveryapp.customer',
    versionCode: 2,
    softwareKeyboardLayoutMode: 'resize',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#FFFFFF',
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
