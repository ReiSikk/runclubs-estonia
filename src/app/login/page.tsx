"use client";

import { useState, useEffect, useRef, Suspense, use } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import LoginWithUsername from "@/app/components/Page - Login/LoginForm";
import SignUpForm from "@/app/components/Page - Login/SignUpForm";
import styles from "./page.module.css";
import FormToast from "../components/Toast/Toast";

function mapAuthError(error: unknown): string {
  if (!error) return "An unknown error occurred.";
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    if (error.code === "auth/email-already-in-use") {
      return "This email is already registered.";
    } else if (error.code === "auth/invalid-email") {
      return "Invalid email address.";
    } else if (error.code === "auth/weak-password") {
      return "Password is too weak.";
    } else if (error.code === "auth/invalid-credential") {
      return "Invalid email or password provided. Please try again.";
    }
  }
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Sign up failed";
}

export default function LoginPage({searchParams}: {searchParams: Promise<{ q?: string }>}) {
  const params = use(searchParams)
  // Form tabs state
  const [activeTab, setActiveTab] = useState("tab1");

  // Toast feedback handlers
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // Update activeTab based on searchParams
  useEffect(() => {
    const id = params.q;
    if (id === "signup") {
      setActiveTab("tab2");
    } else {
      setActiveTab("tab1");
    }
  }, [params.q]);

  // Call this for a regular toast
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setCountdown(null);
    setToastOpen(true);
  };

  // Call this for a success toast with countdown
  const showCountdownToast = (message: string, seconds: number, onComplete?: () => void) => {
    setToastType("success");
    setCountdown(seconds);
    setToastOpen(true);

    if (countdownInterval.current) clearInterval(countdownInterval.current);

    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev && prev > 1) {
          return prev - 1;
        } else {
          clearInterval(countdownInterval.current!);
          setToastOpen(false);
          if (onComplete) onComplete();
          return null;
        }
      });
    }, 1000);

    setToastMessage(message);
  };

  // Compose the toast message
  const composedMessage =
    toastType === "success" && countdown !== null && countdown > 0
      ? `${toastMessage} Redirecting in (${countdown})...`
      : toastMessage;

  return (
    <Suspense fallback={<main className={`${styles.loginPage__main} container`}>
      <div className="loading">Loading...</div>
    </main>}>
    <main className={`${styles.loginPage__main} container`}>
        <FormToast
          open={toastOpen}
          onOpenChange={setToastOpen}
          message={composedMessage}
          type={toastType}
          aria-live="polite"
        />
      <div className={`${styles.loginPage__wrapper} bradius-m`}>
        <Tabs.Root className="tabs__root" defaultValue="tab1" value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List
            className={`tabs__list ${activeTab === "tab1" ? "slide-left" : "slide-right"}`}
            aria-label="Manage your account"
          >
            <Tabs.Trigger className="tabs__trigger" value="tab1">
              Sign In
            </Tabs.Trigger>
            <Tabs.Trigger className="tabs__trigger" value="tab2">
              Sign Up
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="tabs__content" value="tab1">
            <LoginWithUsername showToast={showToast} showCountdownToast={showCountdownToast} mapAuthError={mapAuthError} setActiveTab={setActiveTab}/>
          </Tabs.Content>
          <Tabs.Content className="tabs__content" value="tab2">
            <SignUpForm 
              showToast={showToast}
              showCountdownToast={showCountdownToast}
              setActiveTab={setActiveTab}
              mapAuthError={mapAuthError}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </main>
    </Suspense>
  );
}
