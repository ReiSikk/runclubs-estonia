"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { createEvent } from "@/app/actions";
import FormToast from "../Toast/Toast";
import styles from "../../dashboard/page.module.css";
import { LucideCalendarPlus } from "lucide-react";
import { getAuth } from "firebase/auth";

type RunClubOption = { id: string; name?: string; title?: string };

type Props = {
  runclubId?: string;
  runclubs?: RunClubOption[];
  onClose?: () => void;
};

type FormState =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]>; fieldValues?: Record<string, unknown> }
  | undefined;

const initialState: FormState = undefined;

export default function EventCreationForm({ runclubId, runclubs = [], onClose }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [selectedRunclub, setSelectedRunclub] = useState<string>(runclubId || runclubs[0]?.id || "");
  const [toastOpen, setToastOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (runclubId) setSelectedRunclub(runclubId);
    else if (runclubs.length) setSelectedRunclub(runclubs[0].id);
  }, [runclubId, runclubs]);

  // Open toast when we receive a message
  useEffect(() => {
    if (state?.message) setToastOpen(true);
  }, [state?.message]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => (c ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // When countdown finishes: close form (no redirect) — per request
  useEffect(() => {
    if (countdown === 0) {
      setToastOpen(false);
      setCountdown(null);
      if (onClose) onClose();
    }
  }, [countdown, onClose]);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // prefer the hook user, fallback to firebase client currentUser
    const clientAuth = getAuth();
    const currentUser = user ?? clientAuth.currentUser ?? undefined;

    if (!formRef.current) {
      setState({ success: false, message: "Form is not available." });
      setToastOpen(true);
      return;
    }

    if (!currentUser) {
      setState({ success: false, message: "You must be signed in to create an event." });
      setToastOpen(true);
      return;
    }

    const finalRunclubId = runclubId || selectedRunclub;
    if (!finalRunclubId) {
      setState({ success: false, message: "Please select a run club to create the event for." });
      setToastOpen(true);
      return;
    }

    const formData = new FormData(formRef.current);

    startTransition(async () => {
      try {
        // ensure fresh idToken
        let idToken: string | undefined;
        if (typeof (currentUser as any)?.getIdToken === "function") {
          idToken = await (currentUser as any).getIdToken(true);
        } else if (clientAuth.currentUser) {
          idToken = await clientAuth.currentUser.getIdToken(true);
        }
        if (idToken) formData.set("idToken", idToken);

        const result = await createEvent(undefined, formData);
        setState(result);

        if (result && result.success) {
          if (!formRef.current) return;
          formRef.current.reset();
          setSelectedRunclub(runclubs[0]?.id || "");
          setCountdown(5);
        } else {
          setToastOpen(true);
        }
      } catch (err: any) {
        console.error("Event submit error:", err);
        setState({ success: false, message: err?.message || "Unexpected error" });
        setToastOpen(true);
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={`${styles.form} rcForm fp-col`}>
      {state?.message && (
        <FormToast
          message={state.success && countdown ? `${state.message} Closing in (${countdown})...` : state.message}
          type={state?.success ? "success" : "error"}
          open={toastOpen}
          onOpenChange={setToastOpen}
          aria-live="polite"
        />
      )}

      <div className={`${styles.form__body} rcForm__block fp-col`}>
        <div className={styles.form__header + " rcForm__step h1 fp"}>
          <span className="icon">
            <LucideCalendarPlus size={32} />
          </span>{" "}
          Create an event
        </div>

        <section className={styles.form__section + " rcForm__section bradius-m fp-col"}>
          {!runclubId && (
            <div className="inputRow fp-col">
              <label htmlFor="runclub_id" className="rcForm__label h5">
                Select a run club <span className="rcForm__required">*</span>
              </label>
              <select
                id="runclub_id"
                name="runclub_id"
                required
                className={styles.rcForm__input}
                value={selectedRunclub}
                onChange={(e) => setSelectedRunclub(e.target.value)}
                aria-invalid={!!(state && !state.success && state.errors?.runclub_id)}
              >
                <option value="" disabled>
                  Select a run club
                </option>
                {runclubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ?? c.title ?? `Club ${c.id}`}
                  </option>
                ))}
              </select>
              {state && !state.success && state.errors?.runclub_id && (
                <p className="rcForm__hint" role="alert">
                  {state.errors.runclub_id[0]}
                </p>
              )}
            </div>
          )}

          {runclubId && <input type="hidden" name="runclub_id" value={runclubId} />}

          <div className="inputRow fp-col">
            <label htmlFor="title" className="rcForm__label">
              Event title <span className="rcForm__required">*</span>
            </label>
            <input id="title" name="title" required className="rcForm__input" maxLength={200} />
          </div>

          <div className="inputRow fp">
            <label htmlFor="date" className="rcForm__label">
              Date <span className="rcForm__required">*</span>
            </label>
            <input id="date" name="date" type="date" required className="rcForm__input" />
          </div>

          <div className="inputRow col-2 fp">
            <div className={styles.form__timegroup + " fp-col"}>
              <label htmlFor="startTime" className="rcForm__label">
                Start <span className="rcForm__required">*</span>
              </label>
              <input id="startTime" name="startTime" type="time" required className="rcForm__input" />
            </div>

            <div className={styles.form__timegroup + " fp-col"}>
              <label htmlFor="endTime" className="rcForm__label">
                End
              </label>
              <input id="endTime" name="endTime" type="time" className="rcForm__input" />
            </div>
          </div>

          <div className="inputRow fp-col">
            <label htmlFor="locationName" className="rcForm__label">
              Location <span className="rcForm__required">*</span>
            </label>
            <input id="locationName" name="locationName" className="rcForm__input" maxLength={256} required  />
          </div>

          <div className="inputRow fp-col">
            <label htmlFor="locationUrl" className="rcForm__label">
              Google Maps URL
            </label>
            <input id="locationUrl" name="locationUrl" type="url" className="rcForm__input" placeholder="https://maps.google.com/..." />
          </div>

          <div className="textareaRow fp-col">
            <label htmlFor="about" className="rcForm__label">
              About <span className="rcForm__required">*</span>
            </label>
            <textarea id="about" name="about" rows={6} className="rcForm__textarea" maxLength={5000} required />
          </div>
        </section>
      </div>

      <div className={styles.form__actions + " fp"}>
        <button
          type="submit"
          className="rcForm__submit btn_main white white--alt"
          disabled={isPending}
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? "Creating..." : "Create event"}
        </button>
        {onClose && (
          <button type="button" className={styles.form__cancel + " btn_main accent"} onClick={onClose} disabled={isPending}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}