"use client";

import { useEffect } from "react";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { app } from "../lib/firebase";

const AppCheckWrapper = () => {
  useEffect(() => {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY!),
      isTokenAutoRefreshEnabled: true, // Automatically refresh App Check tokens
    });
  }, []);

  return null;
};

export default AppCheckWrapper;