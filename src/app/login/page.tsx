"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  signInWithPopup,
  signInWithEmailLink,
  isSignInWithEmailLink,
} from "firebase/auth";
import styles from "./page.module.css";
import FormToast from "../components/Toast/Toast";
import mapAuthError from "../lib/firebase/mapAuthError";
import { auth } from "../lib/firebase/firebase";
import { useAuth } from "../providers/AuthProvider";

const APP_BASE_URL = process.env.NODE_ENV === 'development'
 ? 'http://localhost:3000' 
 : process.env.NEXT_PUBLIC_SITE_URL || 'https://runclubs.ee';

//TODO REMOVE LOGGING
console.log("App base URL:", APP_BASE_URL);

const ACTION_CODE_SETTINGS = {
  url: `${APP_BASE_URL}/login`,
  handleCodeInApp: true,
};

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // State for email link sign-in
  const [email, setEmail] = useState("");
  const [linkSending, setLinkSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [verifyingLink, setVerifyingLink] = useState(false);

  // UI feedback state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setCountdown(null);
    setToastOpen(true);
  }, []);

  const showCountdownToast = useCallback(
    (message: string, seconds: number, onComplete?: () => void) => {
      setToastType("success");
      setCountdown(seconds);
      setToastOpen(true);
      if (countdownInterval.current) clearInterval(countdownInterval.current);

      countdownInterval.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev && prev > 1) return prev - 1;
          clearInterval(countdownInterval.current!);
          setToastOpen(false);
          onComplete?.();
          return null;
        });
      }, 1000);

      setToastMessage(message);
    },
    []
  );

  const composedMessage =
    toastType === "success" && countdown !== null && countdown > 0
      ? `${toastMessage} Redirecting in (${countdown})...`
      : toastMessage;

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [loading, user, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    const finishSignIn = async () => {
      try {
        setVerifyingLink(true);
        let storedEmail = window.localStorage.getItem("emailForSignIn");
        if (!storedEmail) {
          storedEmail = window.prompt("Confirm your email to finish signing in") || "";
        }
        if (!storedEmail) {
          showToast("Email confirmation is required", "error");
          return;
        }
        await signInWithEmailLink(auth, storedEmail, window.location.href);
        window.localStorage.removeItem("emailForSignIn");
        showCountdownToast("Sign in successful!", 3, () => router.push("/dashboard"));
      } catch (error) {
        showToast(mapAuthError(error), "error");
      } finally {
        setVerifyingLink(false);
      }
    };

    void finishSignIn();
  }, [router, showToast, showCountdownToast]);

  const handleSendLink = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    if (!email) {
      showToast("Enter an email address first", "error");
      return;
    }

    try {
      setLinkSending(true);
      await sendSignInLinkToEmail(auth, email, ACTION_CODE_SETTINGS);
      window.localStorage.setItem("emailForSignIn", email);
      setLinkSent(true);
      showToast("Magic link sent! Check your inbox.", "success");
    } catch (error) {
      showToast(mapAuthError(error), "error");
    } finally {
      setLinkSending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showCountdownToast("Sign in successful!", 3, () => router.push("/dashboard"));
    } catch (error) {
      showToast(mapAuthError(error), "error");
    }
  };

  return (
    <main className={`${styles.loginPage__main} container`}>
      <FormToast
        open={toastOpen}
        onOpenChange={setToastOpen}
        message={composedMessage}
        type={toastType}
        aria-live="polite"
      />

      <div className={`${styles.loginPage__wrapper} bradius-m`}>
        <div className={styles.loginForm__wrap}>
          <p className="txt-label">Log in or sign up to</p>
          <h1 className={`${styles.loginForm__title} h2`}>Run Clubs Estonia</h1>
          <p className="txt-body">
            Enter your email to get a one-time sign-in link. New members join instantly, existing members log in.
          </p>
        </div>

        <form onSubmit={handleSendLink} className={`${styles.loginForm} bradius-m`}>
          <div className="inputRow">
            <label className="rcForm__label h5" htmlFor="login-email">Email</label>
            <input
              className="rcForm__input email-input"
              id="login-email"
              type="email"
              value={email}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={linkSending || verifyingLink}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="email-input"
            />
          </div>
          <button
            type="submit"
            className="btn_main white"
            disabled={linkSending || verifyingLink}
            style={{cursor: (linkSending || verifyingLink ) ? 'wait' : 'pointer' }}
          >
            {linkSending ? "Sending link..." : "Send link"}
          </button>
          {linkSent && (
            <p className={styles.login__text}>Link sent to {email}. Check your inbox or resend above.</p>
          )}
        </form>

        <div className={styles.login__divider}>
          <span>or</span>
        </div>

        <button
          type="button"
          className={`${styles.loginForm__google} gsi-material-button`}
          onClick={handleGoogleSignIn}
          disabled={verifyingLink}
        >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  style={{ display: "block" }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">Continue with Google</span>
            </div>
        </button>

        {verifyingLink && (
          <p className={styles.login__text}>Verifying your sign-in link, please wait…</p>
        )}
      </div>
    </main>
  );
}