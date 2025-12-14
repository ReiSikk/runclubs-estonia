import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/app/lib/firebase/firebaseAdmin";

export async function GET() {
  try {
    const envVars = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? "set" : "missing",
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? "set" : "missing",
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY,
      NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN_FROM_CI: process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN_FROM_CI,
      NEXT_PUBLIC_WEATHER_API_KEY: process.env.NEXT_PUBLIC_WEATHER_API_KEY,
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
      NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      PLAYWRIGHT_TEST_BASE_URL: process.env.PLAYWRIGHT_TEST_BASE_URL,
      TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
      TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
    };
    console.log("ENV VARS:", envVars);

    let userCount = null;
    try {
      const users = await getAuth(adminApp).listUsers(1);
      userCount = users.users.length;
    } catch (firebaseError) {
      console.error("Firebase Admin test error:", firebaseError);
    }

    return NextResponse.json({ ok: true, envVars, userCount });
  } catch (error) {
    console.error("Debug server action error:", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}