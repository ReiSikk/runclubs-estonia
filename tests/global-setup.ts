import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const debugToken = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN_FROM_CI;
  
  if (!debugToken) {
    console.warn("⚠️ [Global Setup] App Check debug token not found in environment variables");
  } else {
    console.log("✅ [Global Setup] App Check debug token found");
  }

  // Verify the token is set
  console.log("🔧 [Global Setup] Debug token:", debugToken ? "***" + debugToken.slice(-8) : "NOT SET");
}

export default globalSetup;