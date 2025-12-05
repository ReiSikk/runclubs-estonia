"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { createEvent } from "@/app/actions";
import styles from "../Dashboard/DashboardClient.module.css";
import { getAuth } from "firebase/auth";
import { RunClubEvent } from "@/app/lib/types/runClubEvent";
import { db } from "@/app/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import TimePicker, { TimePickerValue } from "react-accessible-time-picker";

type RunClubOption = { id: string; name?: string; title?: string };

type Props = {
  runclubId?: string;
  runclubs?: RunClubOption[];
  onClose?: () => void;
  onEventCreated?: (newEvent: RunClubEvent) => void;
  onToastUpdate?: (toast: { message: string; type: 'success' | 'error'; countdown?: number | null }) => void;
  onToastOpenChange?: (open: boolean) => void;
};

type FormState =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]>; fieldValues?: Record<string, unknown> }
  | undefined;

const initialState: FormState = undefined;

export default function EventCreationForm({ runclubId, runclubs = [], onClose, onEventCreated, onToastUpdate, onToastOpenChange }: Props) {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [selectedRunclub, setSelectedRunclub] = useState<string>(runclubId || runclubs[0]?.id || "");
  const [countdown, setCountdown] = useState<number | null>(null);
  // Handle time
  const [startTime, setStartTime] = useState({ hour: "", minute: "" });
  const [endTime, setEndTime] = useState({ hour: "", minute: "" });
  // Handle time picker values
  const handleStartTimeChange = (value: TimePickerValue) => {
    setStartTime({
      hour: value.hour,
      minute: value.minute,
    });
  };
  const handleEndTimeChange = (value: TimePickerValue) => {
    setEndTime({
      hour: value.hour,
      minute: value.minute,
    });
  };

  useEffect(() => {
    if (runclubId) setSelectedRunclub(runclubId);
    else if (runclubs.length) setSelectedRunclub(runclubs[0].id);
  }, [runclubId, runclubs]);

  // Open toast when we receive a message
   useEffect(() => {
    if (state?.message && onToastUpdate) {
      onToastUpdate({
        message: state.message,
        type: state.success ? 'success' : 'error',
        countdown: state.success ? countdown : undefined
      });
      onToastOpenChange?.(true);
    }
  }, [state, countdown, onToastUpdate, onToastOpenChange]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => (c ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // When countdown finishes: close form (no redirect) — per request
  useEffect(() => {
    if (countdown === 0) {
      onToastOpenChange?.(false);
      setCountdown(null);
      if (onClose) onClose();
    }
  }, [countdown, onClose, onToastOpenChange]);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // prefer the hook user, fallback to firebase client currentUser
    const clientAuth = getAuth();
    const currentUser = user ?? clientAuth.currentUser ?? undefined;

    if (!formRef.current) {
      setState({ success: false, message: "Form is not available." });
      onToastOpenChange?.(true);
      return;
    }

    if (!currentUser) {
      setState({ success: false, message: "You must be signed in to create an event." });
      onToastOpenChange?.(true);
      return;
    }

    const finalRunclubId = runclubId || selectedRunclub;
    if (!finalRunclubId) {
      setState({ success: false, message: "Please select a run club to create the event for." });
      onToastOpenChange?.(true);
      return;
    }

    const formData = new FormData(formRef.current);

     // Add time values directly - format on server if needed
    formData.set("startTime", `${startTime.hour}:${startTime.minute}`);
    
    if (endTime.hour && endTime.minute) {
      formData.set("endTime", `${endTime.hour}:${endTime.minute}`);
    }

    // Get ID token for authentication
    let idToken: string | undefined;
    try {
        idToken = await currentUser.getIdToken(true); // Force refresh to get latest token
        } catch {
        setState({
            success: false,
            message: "Failed to get authentication token.",
            errors: {},
        });
        return;
        }
        
    if (!idToken) {
      setState({ success: false, message: "Authentication expired. Please log in again." });
      onToastOpenChange?.(true);
      return;
    }
    formData.set("idToken", idToken);

    startTransition(async () => {
      try {
        const result = await createEvent(undefined, formData);
        setState(result);

        if (result && result.success) {
          if (!formRef.current) return;

            const eventId = result.id;
            if (!eventId) {
            console.error("No event ID returned from server.");
            return;
            }
            // Fetch the newly created event document
            const eventDoc = await getDoc(doc(db, "events", eventId));
            if (eventDoc.exists()) {
            const newEvent = {
                id: eventDoc.id,
                ...eventDoc.data(),
            } as RunClubEvent;

            // Call the callback function to update eventsState
            if (onEventCreated) {
                onEventCreated(newEvent);
            }
            } else {
            console.error("Event document not found:", eventId);
            }

          formRef.current.reset();
          setSelectedRunclub(runclubs[0]?.id || "");
          setCountdown(5);
        } else {
          onToastOpenChange?.(true);
        }
      } catch (err: unknown) {
        console.error("Event submit error:", err);
        setState({ success: false, message: (err as Error)?.message || "Unexpected error" });
        onToastOpenChange?.(true);
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={`${styles.form} rcForm fp-col`}>
      <div className={`${styles.form__body} rcForm__block fp-col`}>
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
            <input id="title" name="title" required className="rcForm__input" maxLength={256} />
          </div>

          <div className="inputRow fp">
            <label htmlFor="date" className="rcForm__label">
              Date <span className="rcForm__required">*</span>
            </label>
            <input id="date" name="date" type="date" required className="rcForm__input" />
              {state && !state.success && state.errors?.date && (
                <p id="date-error" className="rcForm__hint white" role="alert">
                  {state.errors.date[0]}
                </p>
              )}
          </div>

          <div className="inputRow inputRow--2 fp">
            <div className={styles.form__timegroup + " fp-col"}>
              <label htmlFor="startTime" className="rcForm__label">
                Start <span className="rcForm__required">*</span>
              </label>
               <TimePicker
                id="startTime"
                label=""
                value={startTime}
                onChange={handleStartTimeChange}
                is24Hour
                required
                classes={{
                  container: "rcForm__timePicker",
                  timePicker: "pickerInput",
                  timeInput: "number",
                  timeTrigger: "trigger",
                  label: "rcForm__label",
                  popoverContent: "rcForm__pickerPopover",
                  popoverColumns: "rcForm__popoverColumns",
                  popoverColumn: "rcForm__popoverColumn",
                  popoverColumnTitle: "rcForm__popoverColTitle",
                  popoverItem: "rcForm__popoverItem",
                  popoverActiveItem: "popoverActiveItem",
                }}
              />
            </div>

            <div className={styles.form__timegroup + " fp-col"}>
              <label htmlFor="endTime" className="rcForm__label">
                End
              </label>
              <TimePicker
                id="endTime"
                label=""
                value={endTime}
                onChange={handleEndTimeChange}
                is24Hour
                classes={{
                  container: "rcForm__timePicker",
                  timePicker: "pickerInput",
                  timeInput: "number",
                  timeTrigger: "trigger",
                  label: "rcForm__label",
                  popoverContent: "rcForm__pickerPopover",
                  popoverColumns: "rcForm__popoverColumns",
                  popoverColumn: "rcForm__popoverColumn",
                  popoverColumnTitle: "rcForm__popoverColTitle",
                  popoverItem: "rcForm__popoverItem",
                  popoverActiveItem: "popoverActiveItem",
                }}
              />
            </div>
          </div>

          <div className="inputRow fp-col">
            <label htmlFor="locationName" className="rcForm__label">
              Location <span className="rcForm__required">*</span>
            </label>
            <input id="locationName" name="locationName" className="rcForm__input" maxLength={256} placeholder="e.g. Tallinn, Kadriorg Park" required  />
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
            <textarea id="about" name="about" placeholder="What should runners know? Describe the route, pace (easy/moderate/fast), difficulty level, what to bring, and any post-run plans like coffee or stretching together!" rows={6} className="rcForm__textarea" maxLength={5000} required />
          </div>
        </section>
      </div>

      <div className={styles.form__actions + " fp"}>
          {onClose && (
          <button type="button" className={styles.form__cancel + " btn_main accent"} onClick={onClose} disabled={isPending}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="rcForm__submit btn_main white white--alt"
          disabled={isPending}
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? "Creating..." : "Create event"}
        </button>
      </div>
    </form>
  );
}