import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAnalytics,
  isSupported,
  logEvent,
  setAnalyticsCollectionEnabled,
  type Analytics,
} from "firebase/analytics";

const firebaseConfig = {
  apiKey: `${import.meta.env.VITE_FIREBASE_API_KEY}`,
  authDomain: "guess-the-accc.firebaseapp.com",
  projectId: "guess-the-accc",
  storageBucket: "guess-the-accc.firebasestorage.app",
  messagingSenderId: "629962076070",
  appId: "1:629962076070:web:b505b68f950aa11d9a6967",
  measurementId: "G-SMJYLB0BBZ",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let analytics: Analytics | null = null;

/** Call this once on app start */
export async function initAnalytics(opts?: { enabled?: boolean }) {
  // Only run in browser and only when measurementId exists
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.measurementId) return null;

  try {
    const supported = await isSupported();
    if (!supported) return null;

    analytics = getAnalytics(app);

    if (opts?.enabled === false) {
      setAnalyticsCollectionEnabled(analytics, false);
    } else {
      setAnalyticsCollectionEnabled(analytics, true);
    }

    return analytics;
  } catch (e) {
    console.warn("Analytics not available:", e);
    return null;
  }
}

export function track<EventParams extends Record<string, any>>(
  name: string,
  params?: EventParams
) {
  if (!analytics) return;
  logEvent(analytics, name, params);
}
