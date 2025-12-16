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
import RichTextEditor from "./RichTextEditor";
import EventLocationPicker from "./EventLocationPicker";

type RunClubOption = { id: string; name?: string; title?: string };

type Props = {
  mode: "create" | "update";
  eventId?: string;
  initialValues?: Partial<RunClubEvent> | null;
  runclubId?: string;
  runclubs?: RunClubOption[];
  preselectedClubId?: string | null;
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
  onClose?: () => void;
};

type FormState =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]>; fieldValues?: Record<string, unknown> }
  | undefined;

const initialState: FormState = undefined;
export default function EventCreationForm({ mode, eventId, initialValues, runclubId, runclubs = [], preselectedClubId, onSuccess, onError, onClose }: Props) {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formState, setFormState] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedRunclub, setSelectedRunclub] = useState<string>(
    preselectedClubId || initialValues?.runclub_id || ""
  );
  // Image ref and preview
  const imageUploadFieldRef = useRef<{ reset: () => void } | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  // For resetting tags
  const [resetKey, setResetKey] = useState(0);
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
    setSelectedRunclub(preselectedClubId || runclubId || runclubs[0]?.id || "");
    setExistingImageUrl(null);
    setResetKey((k) => k + 1);
    imageUploadFieldRef.current?.reset?.();
    formRef.current?.reset();
  }, [mode, preselectedClubId, runclubId, runclubs]);

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


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Guard: ignore if already submitting/pending
    if (isSubmitting || isPending) return;

    // prefer the hook user, fallback to firebase client currentUser
    const clientAuth = getAuth();
    const currentUser = user ?? clientAuth.currentUser ?? undefined;

    if (!formRef.current) {
      onError?.("Form is not available.");
      return;
    }

    if (!currentUser) {
      onError?.("You must be signed in to create an event.");
      return;
    }

    const finalRunclubId = runclubId || selectedRunclub;
    if (!finalRunclubId) {
      onError?.("Please select a run club to create the event for.");
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
        setFormState({
            success: false,
            message: "Failed to get authentication token.",
            errors: {},
        });
        return;
        }
        
    if (!idToken) {
      onError?.("Authentication expired. Please log in again.");
      return;
    }
    formData.set("idToken", idToken);

    // Check description length, strip HTML tags
    const rawDescription = formData.get('description') as string;
    const strippedText = rawDescription.replace(/<[^>]*>/g, '').trim();
    if (strippedText.length > 5000) {
      onError?.('Description exceeds 5000 characters. Please shorten it.');
      return;
    }

    // All pre check passed - set as submitting
    setIsSubmitting(true);

    startTransition(async () => {
      try {
        if (!formRef.current) return;
        const result = await saveEvent(undefined, formData);
        setFormState(result);

        if (!result?.success) {
          onError?.(result.message);
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
          onSuccess?.(result.message);
        }

        onSuccess?.(result.message);
        imageUploadFieldRef.current?.reset?.();
      } catch (err: unknown) {
        console.error("Event submit error:", err);
        onError?.("An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
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
                value={preselectedClubId || selectedRunclub}
                onChange={(e) => setSelectedRunclub(e.target.value)}
                aria-invalid={!!(formState && !formState.success && formState.errors?.runclub_id)}
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
              {formState && !formState.success && formState.errors?.runclub_id && (
                <p className="rcForm__hint" role="alert">
                  {formState.errors.runclub_id[0]}
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
              {formState && !formState.success && formState.errors?.date && (
                <p id="date-error" className="rcForm__hint white" role="alert">
                  {formState.errors.date[0]}
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

          {/* <div className="inputRow fp-col">
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
          </div> */}

          <div className="inputRow inputRow__gmaps fp-col">
            <EventLocationPicker />
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
            allowedTypes={["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]} 
            initialUrl={showExistingImage ? existingImageUrl! : undefined}
            onRemove={handleImgRemove}
            colorScheme="dark"
            />

          </div>
          <EventTagsField name="tags" maxTags={3} resetKey={resetKey} initialTags={initialValues?.tags || []} />

          <div className="textareaRow rte fp-col">
            <label htmlFor="about" className="rcForm__label">
              Description <span className="rcForm__required">*</span>
            </label>
              <RichTextEditor
                name="description"
                initialValue={initialValues?.description || ''} // Pre-fill for edit mode
                placeholder="Describe your run club. What should members know? Include details like meeting points, pace, and any rules."
              />
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
          disabled={isPending || isSubmitting}
          aria-disabled={isPending || isSubmitting}
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {mode === "create" ? (isPending ? "Creating..." : "Create Event") : isPending ? "Updating..." : "Update Event"}
        </button>
      </div>
    </form>
  );
}