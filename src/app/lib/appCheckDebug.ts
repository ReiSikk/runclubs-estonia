if (typeof window !== "undefined") {
  const isCI = process.env.NEXT_PUBLIC_CI === "true";
  const isHeadless = /HeadlessChrome|Headless/i.test(navigator.userAgent);
  const debugToken = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN_FROM_CI;
  const isDev = process.env.NODE_ENV === "development";
  const isTestEnv = isCI || isHeadless;

  console.log("🔧 [AppCheck Debug] Checking environment...", { isCI, isHeadless, isDev, isTestEnv, hasToken: !!debugToken });

  if ((isTestEnv || isDev) && debugToken) {
    console.log("🔧 [AppCheck Debug] Setting debug token");
    (window as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  } else if (isDev) {
    console.log("🔧 [AppCheck Debug] Setting auto debug token for dev");
    (window as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
}

export {};