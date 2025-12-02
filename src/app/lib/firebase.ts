import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from "firebase/app-check";
import { getAuth } from "firebase/auth";

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
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

if (typeof window !== "undefined") {
  const isDev = process.env.NODE_ENV === "development";
  const isCI = process.env.NEXT_PUBLIC_CI === "true";
  const debugToken = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN_FROM_CI;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  const isHeadless = /HeadlessChrome|Headless/i.test(navigator.userAgent);
  const isTestEnv = isCI || isHeadless;

  console.log("🔍 [Firebase] Environment:", { isDev, isCI, isHeadless, isTestEnv });

  if (isTestEnv) {
    // CI/Testing: Skip App Check entirely (enforcement disabled for Auth)
    console.log("🔧 [Firebase Init] Test environment - skipping App Check");
    
  } else if (isDev) {
    // Development: Use debug token
    if (debugToken) {
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
      console.log("🔧 [Firebase Init] Dev mode - using env debug token");
    } else {
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      console.log("🔧 [Firebase Init] Dev mode - using auto-generated debug token");
    }

    if (recaptchaKey) {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
    }
  } else {
    // Production: Use reCAPTCHA Enterprise
    if (recaptchaKey) {
      console.log("🔧 [Firebase Init] Production - using reCAPTCHA Enterprise");
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
    } else {
      console.error("❌ [Firebase Init] Missing RECAPTCHA_ENTERPRISE_SITE_KEY in production!");
    }
  }
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export { app };