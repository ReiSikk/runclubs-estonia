import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaEnterpriseProvider, CustomProvider } from "firebase/app-check";
import { getAuth } from "firebase/auth";

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean;
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

if (typeof window !== 'undefined') {
  const debugToken = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN_FROM_CI;
  
  // This handles both Local Development (if you put token in .env.local) AND CI
  if (debugToken) {
    console.log('[App Check] Using CustomProvider with Debug Token.');
    
    initializeAppCheck(app, {
      provider: new CustomProvider({
        getToken: async () => ({
          token: debugToken,
          // Set to 1 hour to prevent timeout during long test suites
          expireTimeMillis: Date.now() + 1000 * 60 * 60, 
        }),
      }),
      isTokenAutoRefreshEnabled: false,
    });
  } else if (process.env.NODE_ENV === 'development') {
    // Local dev without a token -> Generate one for console
    console.log('[App Check] Dev mode: generating debug token.');
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(
        process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY!
      ),
      isTokenAutoRefreshEnabled: true,
    });
  } else {
    // Production / Fallback
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(
        process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY!
      ),
      isTokenAutoRefreshEnabled: true,
    });
  }
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export { app };