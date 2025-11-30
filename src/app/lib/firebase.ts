import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAuth } from "firebase/auth";


declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (only if it hasn't been initialized already)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

if (typeof window !== 'undefined') {
  // Set debug token for development AND CI environments
  const debugToken = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN_FROM_CI;
  const isCI = process.env.CI === 'true';
  const isDev = process.env.NODE_ENV === 'development';

  if ((isDev || isCI) && debugToken) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  } else if (isDev && !debugToken) {
    // Auto-generate token in development if not provided
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    console.log('🔧 App Check Debug Mode: Auto-generating token');
  }

  initializeAppCheck(app, {

    provider: new ReCaptchaEnterpriseProvider(
      process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY!
    ),
    isTokenAutoRefreshEnabled: true, // Recommended to keep tokens fresh automatically

  });

}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export { app };
