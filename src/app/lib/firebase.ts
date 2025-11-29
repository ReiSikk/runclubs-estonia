import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaEnterpriseProvider, CustomProvider } from "firebase/app-check";
import { getAuth } from "firebase/auth";

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean; // Add the property to the Window interface
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
  console.log(`[Firebase Init] CI: ${isCI}, Dev: ${isDev}, Token Available: ${!!debugToken}`);

 if (isCI && debugToken) {
    // 1. In CI, force the use of the debug token using CustomProvider.
    // This bypasses the reCAPTCHA call completely, solving the CI timeout.
    
    console.log('[Firebase Init] Using CustomProvider for CI/Debug Token.');
    
    initializeAppCheck(app, {
      provider: new CustomProvider({
        // getToken must return a Promise of an AppCheckTokenResult
        getToken: async () => ({
          token: debugToken,
          // Set a generous expiration time (e.g., 5 minutes)
          expireTimeMillis: Date.now() + 300000, 
        }),
      }),
      isTokenAutoRefreshEnabled: false, // Turn off refresh since it's a static debug token
    });

  } else if (isDev && !debugToken) {
    // 2. In Dev mode without a provided token, enable the debug token generation mode.
    // The SDK will now output a token to the console which you can copy.
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    console.log('🔧 [Firebase Init] Dev Mode: Auto-generating token for copy/paste.');

    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(
        process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY!
      ),
      isTokenAutoRefreshEnabled: true,
    });

  } else {
    // 3. Standard production or dev mode with token (if provided through other means)
    console.log('[Firebase Init] Using standard ReCaptchaEnterpriseProvider.');
    
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
