import { app } from "./firebase";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

let appCheckInitialized = false;

export function initializeAppCheckClient() {
  if (typeof window === "undefined") return;
  if (appCheckInitialized) return;

  const isDev = process.env.NODE_ENV === "development";
  const isCI = process.env.NEXT_PUBLIC_CI === "true";
  const isHeadless = /HeadlessChrome|Headless/i.test(navigator.userAgent);
  const isTestEnv = isCI || isHeadless;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;

  if (isTestEnv) {
    console.log("🔧 [Firebase Init] Test environment - skipping App Check");
    appCheckInitialized = true;
    return;
  }

  if (isDev) {
    const debugToken = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN_FROM_CI;
    if (debugToken) {
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
      console.log("🔧 [Firebase Init] Dev mode - using env debug token");
    } else {
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      console.log("🔧 [Firebase Init] Dev mode - using auto-generated debug token");
    }
  }

  if (!recaptchaKey) {
    console.error("❌ [Firebase Init] Missing NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY!");
    return;
  }

  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaKey),
      isTokenAutoRefreshEnabled: true,
    });
    appCheckInitialized = true;
    console.log(`✅ [Firebase Init] App Check initialized (${isDev ? "dev" : "prod"})`);
  } catch (error) {
    console.warn("⚠️ [Firebase Init] App Check initialization failed:", error);
  }
}
