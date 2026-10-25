# Food Delivery App

A cross-platform mobile application for discovering restaurants, browsing menus, and managing food orders. Built with **Expo** and **React Native**, the project is structured for production-scale development: file-based routing, typed API layers, server-state caching, and utility-first styling.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Expo SDK 56 · React Native 0.85 · React 19 |
| **Language** | TypeScript 6 (strict mode) |
| **Routing** | Expo Router (file-based, stack navigation) |
| **Styling** | NativeWind v4 · Tailwind CSS 3 |
| **Server State** | TanStack Query v5 |
| **Client State** | Zustand |
| **HTTP** | Axios |
| **Storage** | AsyncStorage · Expo Secure Store |
| **Media & Location** | Expo Image · Expo Location |
| **Icons** | Lucide React Native |
| **Animation** | React Native Reanimated 4 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation                        │
│  app/ (Expo Router screens) · components/ (UI)          │
├─────────────────────────────────────────────────────────┤
│                     State Layer                         │
│  Zustand (cart, session) · TanStack Query (API cache)   │
├─────────────────────────────────────────────────────────┤
│                     Data Layer                          │
│  lib/api.ts (Axios) · lib/query-client.ts               │
├─────────────────────────────────────────────────────────┤
│                     Platform                            │
│  iOS · Android · Web (Metro bundler)                  │
└─────────────────────────────────────────────────────────┘
```

**Design decisions**

- **Expo Router** — Routes live in `app/` as files, enabling deep linking, typed routes, and colocated layouts without a separate navigation config.
- **TanStack Query** — Handles fetching, caching, background refetch, and error/retry logic for restaurant and order data.
- **Zustand** — Lightweight global state for cart and session data that does not belong in the server cache.
- **NativeWind** — Tailwind utility classes compile to React Native styles, keeping UI consistent across platforms with a shared design token system.

---

## Project Structure

```
TOKAJO FOODS/
├── app/                    # Expo Router — file-based routes
│   ├── _layout.tsx         # Root layout (providers, stack navigator)
│   └── index.tsx           # Home screen
├── components/             # Reusable UI components
├── lib/
│   ├── api.ts              # Axios instance & base config
│   └── query-client.ts     # TanStack Query client defaults
├── store/
│   └── cart-store.ts       # Zustand cart state
├── assets/                 # Icons, splash, adaptive icons
├── global.css              # Tailwind directives
├── tailwind.config.js      # Design tokens & content paths
├── babel.config.js         # NativeWind + Reanimated presets
├── metro.config.js         # Metro + NativeWind integration
├── app.json                # Expo configuration
└── .env.example            # Environment variable template
```

Path aliases are configured via `@/*` in `tsconfig.json`.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | `^20.19.4` · `^22.13.0` · `^24.3.0` · or `>= 25.0.0` |
| **npm** | 10+ |
| **Expo Go** | Latest (physical device testing) |
| **Android Studio** | Optional (Android emulator) |
| **Xcode** | Optional (iOS simulator — macOS only) |

> **Note:** Node `v22.12.0` may emit engine warnings. Upgrading to `v22.13.0+` is recommended for full compatibility with React Native 0.85.

---

## Getting Started

### 1. Clone and install

```bash
git clone <repository-url>
cd TOKAJO FOODS
npm install
```

If you encounter peer dependency conflicts during install:

```bash
npm install --legacy-peer-deps
```

### 2. Configure environment

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend REST API base URL | `https://api.tokajofoods.com` (production) · LAN IP like `http://192.168.x.x:4000` (local) |

Expo exposes only variables prefixed with `EXPO_PUBLIC_` to the client bundle.

### 3. Start the development server

```bash
npm start
```

| Command | Action |
|---------|--------|
| `npm start` | Launch Expo dev server (Metro) |
| `npm run android` | Open on Android emulator or device |
| `npm run ios` | Open on iOS simulator (macOS only) |
| `npm run web` | Open in the browser |

From the Expo CLI menu: press **`a`** for Android, **`w`** for web, or scan the QR code with **Expo Go** on a physical device.

---

## Styling & Design System

Styling uses **NativeWind** — Tailwind CSS for React Native. Apply classes via the `className` prop:

```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-xl font-bold text-primary">Order Now</Text>
</View>
```

### Brand tokens

Defined in `tailwind.config.js`:

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#FF6B35` | CTAs, accents, brand highlights |
| `primary-dark` | `#E55A2B` | Pressed / active states |
| `primary-light` | `#FF8F66` | Subtle backgrounds |
| `secondary` | `#2D3436` | Headings, primary text |
| `secondary-light` | `#636E72` | Body text, captions |

Dark mode is configured with `darkMode: 'class'` for correct behavior on web and native.

---

## State Management

### Server state (TanStack Query)

Configured in `lib/query-client.ts` with a 5-minute stale time and 2 retries. Use for restaurant listings, menus, order history, and tracking.

```tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const { data, isLoading } = useQuery({
  queryKey: ['restaurants'],
  queryFn: () => api.get('/restaurants').then((res) => res.data),
});
```

### Client state (Zustand)

The cart store in `store/cart-store.ts` manages line items, quantities, and totals locally before checkout.

```tsx
import { useCartStore } from '@/store/cart-store';

const { items, addItem, totalItems } = useCartStore();
```

---

## API Layer

`lib/api.ts` provides a preconfigured Axios instance:

- Base URL from `EXPO_PUBLIC_API_URL`
- 15-second request timeout
- JSON content type headers

Extend with interceptors for auth tokens (e.g. from `expo-secure-store`) as the backend is integrated.

---

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| **Android** | Supported | Expo Go or development build |
| **iOS** | Supported | Expo Go or Xcode simulator (macOS) |
| **Web** | Supported | Metro bundler via `react-native-web` |

Location services (`expo-location`) require runtime permissions on physical devices. Secure token storage uses `expo-secure-store` on native and falls back appropriately on web.

---

## Type Checking

```bash
npx tsc --noEmit
```

TypeScript runs in **strict** mode. NativeWind types are provided via `nativewind-env.d.ts`.

---

## Troubleshooting

### NativeWind dark mode error on web

If you see:

```
Cannot manually set color scheme, as dark mode is type 'media'
```

Ensure `tailwind.config.js` includes `darkMode: 'class'`, then restart Metro with a cleared cache:

```bash
npx expo start --clear
```

### Metro cache issues

```bash
npx expo start --clear
```

### Dependency resolution errors

```bash
npm install --legacy-peer-deps
```

---

## Roadmap

- [ ] Authentication flow (login, register, session persistence)
- [ ] Restaurant discovery (search, filters, categories)
- [ ] Menu browsing and item customization
- [ ] Cart checkout and payment integration
- [ ] Real-time order tracking with maps
- [ ] Push notifications for order status
- [ ] User profile and order history

---

## License

Private — All rights reserved.

# TOKAJO-FOOD
# food-apkerror-1
