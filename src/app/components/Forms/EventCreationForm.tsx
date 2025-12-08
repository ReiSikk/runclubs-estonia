"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { saveEvent } from "@/app/actions";
import styles from "../Dashboard/DashboardClient.module.css";
import { getAuth } from "firebase/auth";
import { RunClubEvent } from "@/app/lib/types/runClubEvent";
import { db } from "@/app/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import TimePicker, { TimePickerValue } from "react-accessible-time-picker";
import EventTagsField from "./EvenTagsField";
import ImageUploadField from "./ImageUploadField";

type RunClubOption = { id: string; name?: string; title?: string };

type Props = {
  mode: "create" | "update";
  eventId?: string;
  initialValues?: Partial<RunClubEvent> | null;
  runclubId?: string;
  runclubs?: RunClubOption[];
  onClose?: () => void;
  onEventCreated?: (newEvent: RunClubEvent) => void;
  onEventUpdated?: (updatedEvent: RunClubEvent) => void;
  onToastUpdate?: (toast: { message: string; type: 'success' | 'error'; countdown?: number | null }) => void;
  onToastOpenChange?: (open: boolean) => void;
};

type FormState =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]>; fieldValues?: Record<string, unknown> }
  | undefined;

const initialState: FormState = undefined;

export default function EventCreationForm({ mode, eventId, initialValues, runclubId, runclubs = [], onClose, onEventCreated, onEventUpdated, onToastUpdate, onToastOpenChange }: Props) {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [selectedRunclub, setSelectedRunclub] = useState<string>(runclubId || runclubs[0]?.id || "");
  // Image ref and preview
  const imageUploadFieldRef = useRef<{ reset: () => void } | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  // For resetting tags
  const [resetKey, setResetKey] = useState(0);
  // Handle time
  const [countdown, setCountdown] = useState<number | null>(null);
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


  const handleImgRemove = () => {
    setExistingImageUrl(null);
    setRemoveImage(true);
  }


  // Pre-populate form for update mode
  useEffect(() => {
    if (mode === "update" && initialValues) {
      if (initialValues.startTime) {
        const [hour, minute] = initialValues.startTime.split(":");
        setStartTime({ hour, minute });
      }
      if (initialValues.endTime) {
        const [hour, minute] = initialValues.endTime.split(":");
        setEndTime({ hour, minute });
      }
      if (initialValues.image) {
        setExistingImageUrl(initialValues.image);
      }
      setSelectedRunclub(initialValues.runclub_id || runclubId || "");
      // Set resetKey to pre-populate tags
      setResetKey(k => k + 1);
    }
  }, [mode, initialValues, runclubId]);

  // Reset form when switching to create mode
  useEffect(() => {
    if (mode !== "create") return;
    setStartTime({ hour: "", minute: "" });
    setEndTime({ hour: "", minute: "" });
    setSelectedRunclub(runclubId || runclubs[0]?.id || "");
    setExistingImageUrl(null);
    setResetKey((k) => k + 1);
    imageUploadFieldRef.current?.reset?.();
    formRef.current?.reset();
  }, [mode]);

  // Determine if we should show existing image
  const showExistingImage = mode === "update" && existingImageUrl;

  // Set default selected runclub
   useEffect(() => {
    if (mode === "update") return;
    if (runclubId) {
      setSelectedRunclub(runclubId);
    } else if (runclubs.length) {
      setSelectedRunclub(runclubs[0].id);
    }
  }, [mode, runclubId, runclubs]);

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

     // Add mode and eventId
    formData.set("mode", mode);
    if (eventId) formData.set("eventId", eventId);

     // Add time values directly - format on server if needed
    formData.set("startTime", `${startTime.hour}:${startTime.minute}`);
    
    if (endTime.hour && endTime.minute) {
      formData.set("endTime", `${endTime.hour}:${endTime.minute}`);
    }

    // Pass flag for image removal
    formData.set("removeImage", removeImage ? "true" : "false");

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
        if (!formRef.current) return;
        const result = await saveEvent(undefined, formData);
        setState(result);

        if (!result?.success) {
          onToastOpenChange?.(true);
          return;
        }

        const savedId = result.id ?? eventId;
        if (!savedId) {
          console.error("No event ID returned from server.");
          return;
        }

        const eventDoc = await getDoc(doc(db, "events", savedId));
        if (!eventDoc.exists()) {
          console.error("Event document not found:", savedId);
          return;
        }

        const savedEvent = { id: eventDoc.id, ...eventDoc.data() } as RunClubEvent;

        if (mode === "update") {
          onEventUpdated?.(savedEvent);
          onClose?.();
          return;
        }

        onEventCreated?.(savedEvent);
        setResetKey((k) => k + 1);
        formRef.current.reset();
        setStartTime({ hour: "", minute: "" });
        setEndTime({ hour: "", minute: "" });
        setSelectedRunclub(runclubId || runclubs[0]?.id || "");
        imageUploadFieldRef.current?.reset?.();
        setCountdown(3);
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
            <input id="title" name="title" defaultValue={initialValues?.title || ""} required className="rcForm__input" maxLength={256} />
          </div>

          <div className="inputRow fp">
            <label htmlFor="date" className="rcForm__label">
              Date <span className="rcForm__required">*</span>
            </label>
            <input id="date" name="date" type="date" defaultValue={initialValues?.date || ""} required className="rcForm__input" />
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
                hourPlaceholder={initialValues?.startTime ? initialValues.startTime.split(":")[0] : "HH"}
                minutePlaceholder={initialValues?.startTime ? initialValues.startTime.split(":")[1] : "MM"}
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
                hourPlaceholder={initialValues?.endTime ? initialValues.endTime.split(":")[0] : "HH"}
                minutePlaceholder={initialValues?.endTime ? initialValues.endTime.split(":")[1] : "MM"}
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
            <label htmlFor="locationAddress" className="rcForm__label">
              Location <span className="rcForm__required">*</span>
            </label>
            <input id="locationAddress" name="locationAddress" className="rcForm__input" maxLength={256} placeholder="e.g. Tallinn, Kadriorg Park" defaultValue={initialValues?.locationAddress} required  />
          </div>

          <div className="inputRow fp-col">
            <label htmlFor="locationUrl" className="rcForm__label">
              Google Maps URL
            </label>
            <input id="locationUrl" name="locationUrl" type="url" className="rcForm__input" placeholder="https://maps.google.com/..." defaultValue={initialValues?.locationUrl} />
          </div>

          <div className="inputRow fp-col">
            <label htmlFor="distance" className="rcForm__label">Distance (km) <span className="rcForm__required">*</span></label>
            <input id="distance" name="distance" type="number" step="0.1" min="0" defaultValue={initialValues?.distance} required className="rcForm__input" />
          </div>
          <div className="inputRow fp-col">
            <label htmlFor="pace" className="rcForm__label">Pace (e.g. 6:00 min/km)</label>
            <input id="pace" name="pace" type="text" defaultValue={initialValues?.pace} className="rcForm__input" />
          </div>

          <div className="inputRow">
          <label htmlFor="image" className={`rcForm__label h5`}>
            Event image <span className={styles.small}>(JPG, PNG, WEBP, SVG, max 5MB)</span>
          </label>
          <ImageUploadField 
            name="image" 
            altStyle={true} 
            allowedTypes={["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]} 
            initialUrl={showExistingImage ? existingImageUrl! : undefined}
            onRemove={handleImgRemove}
            />

          </div>
          <EventTagsField name="tags" maxTags={3} resetKey={resetKey} initialTags={initialValues?.tags || []} />

          <div className="textareaRow fp-col">
            <label htmlFor="about" className="rcForm__label">
              About <span className="rcForm__required">*</span>
            </label>
            <textarea id="about" name="about" placeholder="What should runners know? Describe the route, pace (easy/moderate/fast), difficulty level, what to bring, and any post-run plans like coffee or stretching together!"
            defaultValue={initialValues?.about} rows={6} className="rcForm__textarea" maxLength={5000} required />
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
          {mode === "create" ? (isPending ? "Creating..." : "Create Event") : isPending ? "Updating..." : "Update Event"}
        </button>
      </div>
    </form>
  );
}