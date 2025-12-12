"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RunClubRegistrationForm from "../components/Forms/RunClubRegistrationForm";
import styles from "./page.module.css";
import NavBar from "../components/Navbar/NavBar";
import { useAuth } from "../providers/AuthProvider";
import LoaderSpinner from "../components/Loader/LoaderSpinner";
import Link from "next/link";
import FormToast from "../components/Toast/Toast";

function SubmitRunClubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Add toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; countdown?: number | null } | null>(
    null
  );
  const [toastOpen, setToastOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

    // Countdown timer effect
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
      if (countdown - 1 === 0) {
        setToastOpen(false);
        router.push('/');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (toast && toast.type === "success" && toast.countdown !== countdown) {
      setToast({ ...toast, countdown });
    }
  }, [countdown]);

  const handleSuccess = (msg: string, duration: number) => {
    setToast({ message: msg, type: "success", countdown: duration });
    setToastOpen(true);
    setCountdown(duration);
  };

  if (loading) {
    return (
      <div className={`${styles.page} ${styles.empty} page--loading container`}>
        <div className="loader fp">
          <LoaderSpinner size={12} />
          <h1 className="h4">Fetching your user profile</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${styles.page} ${styles.empty} page--loading mt-0 container`}>
        <div className="loader fp-col">
          <h1 className="h4">Please sign in or create an account to submit a run club.</h1>
          <Link href="/login" className="btn_main accent">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} page-submit-runclub container`} id="page-top">
      <NavBar backTo="/" />
      {toast && toastOpen && (
        <FormToast
          message={
            toast.type === "success" && toast.countdown
              ? `${toast.message} Redirecting in (${toast.countdown})...`
              : toast.message
          }
          type={toast.type}
          open={toastOpen}
          onOpenChange={setToastOpen}
          aria-live="polite"
        />
      )}
      <RunClubRegistrationForm
        mode="create"
        onToastUpdate={setToast}
        onToastOpenChange={setToastOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default SubmitRunClubPage;
