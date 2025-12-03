"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import styles from "./RunClubRegistrationForm.module.css";
import FormToast from "../Toast/Toast";
import { LucideUpload, LucideX } from "lucide-react";
import { saveRunClub } from "@/app/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TimePicker, { TimePickerValue } from "react-accessible-time-picker";
import { useAuth } from "@/app/providers/AuthProvider";
import { FormState } from "@/app/lib/types/serverActionReturn";
import { RunClub } from "@/app/lib/types/runClub";

const initialState: FormState = undefined;

interface Props {
  mode: "create" | "update";
  clubId?: string;
  initialValues?: RunClub;
  onEditSuccess?: () => void;
}

export default function RunClubRegistrationForm({ mode, clubId, initialValues, onEditSuccess }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [countdown, setCountdown] = useState<number | null>(null);
  // Get current user from auth context
  const { user } = useAuth();

  // Feedback toast state
  const [toastOpen, setToastOpen] = useState(false);
  // Form and file input refs
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // File preview and error states
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [removeExistingLogo, setRemoveExistingLogo] = useState(false);
  // TimePicker state
  const [time, setTime] = useState({ hour: "", minute: "" });

  // Pre-populate form fields when in update mode
  useEffect(() => {
    if (mode === "update" && initialValues) {
      // Set time picker
      if (initialValues.startTime) {
        const [hour, minute] = initialValues.startTime.split(":");
        setTime({ hour, minute });
      }

      // Set file preview if logo exists
      if (initialValues.logo) {
         setExistingLogoUrl(initialValues.logo);
      }
    }
  }, [mode, initialValues]);

  // Handle time picker values
  const handleTimeChange = (value: TimePickerValue) => {
    setTime({
      hour: value.hour,
      minute: value.minute,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFileError(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];

    // Validate file size
    if (file.size > maxSize) {
      setFileError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 5MB.`);
      setFilePreview(null);
      event.target.value = "";
      return;
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setFileError("Accepted formats: JPG, JPEG, PNG, WEBP, SVG.");
      setFilePreview(null);
      event.target.value = "";
      return;
    }

    // File is valid, show preview
    setFileError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
      // When new file is selected, replace existing logo
      setRemoveExistingLogo(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle removing existing logo (update mode only)
  const handleRemoveExistingLogo = () => {
    setExistingLogoUrl(null);
    setRemoveExistingLogo(true);
  };


  // Handle removing new file selection
  const handleRemoveNewFile = () => {
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // If we had an existing logo and haven't explicitly removed it, restore it
    if (initialValues?.logo && !removeExistingLogo) {
      setExistingLogoUrl(initialValues.logo);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // Get current user id token
    if (!user) {
      setState({
        success: false,
        message: "You must be logged in to submit a run club.",
        errors: {},
      });
      return;
    }

    let idToken: string | null = null;
    try {
      idToken = await user.getIdToken(true); // Force refresh to get latest token
    } catch {
      setState({
        success: false,
        message: "Failed to get authentication token.",
        errors: {},
      });
      return;
    }

    if (!idToken) {
      setState({
        success: false,
        message: "Authentication token missing. Please log in again.",
        errors: {},
      });
      return;
    }

    // Add mode and clubId to formData
    formData.append("mode", mode);
    if (clubId) {
      formData.append("clubId", clubId);
    }
    
    // Add idToken to form data
    formData.append("idToken", idToken);


    startTransition(async () => {
      try {
        const result = await saveRunClub(state, formData);

        setState(result);

        if (result.success) {
          if (mode === "create") {
            // Clear form only on create
            if (formRef.current) {
              formRef.current.reset();
              setFilePreview(null);
              setExistingLogoUrl(null);
              setFileError(null);
              handleTimeChange({ hour: "", minute: "" });
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }

            // Start countdown and redirect
            setCountdown(5);
            setTimeout(() => {
              router.push("/");
            }, 5000);
          } else {
            // Update mode: call onEditSuccess callback (close modal)
            setTimeout(() => {
              onEditSuccess?.();
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Form submission error:", error);
        setState({
          success: false,
          message: "An unexpected error occurred. Please try again.",
          errors: {},
        });
      }
    });
  };

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (state?.message) {
      setToastOpen(true);
    }
  }, [state?.message]);

    // Determine which logo to show
  const showExistingLogo = mode === "update" && existingLogoUrl && !filePreview;
  const showNewPreview = !!filePreview;

  return (
    <form onSubmit={handleSubmit} ref={formRef}  className={`${styles.rcForm} ${mode === "create" ? styles.create : styles.update} fp-col`}>
      {state?.message && (
        <FormToast
          message={
            state.success && mode === "create" && countdown !== null && countdown > 0
              ? `${state.message} Redirecting in (${countdown})...`
              : state.message
          }
          type={state?.success ? "success" : "error"}
          open={toastOpen}
          onOpenChange={setToastOpen}
          aria-live="polite"
        />
      )}

      <div className={styles.rcForm__header}>
        <h1 className={styles.rcForm__title}>
           {mode === "create" ? "Register a new running club" : "Update your running club"}
        </h1>
        <p>
          {mode === "create" 
            ? "Fill out the form below to submit your club to our list." 
            : "Update your club information below."}
        </p>
        <p>
          Please feel free to answer in <strong>Estonian</strong> or <strong>English</strong> as you prefer.
        </p>
      </div>

      <div className={`${styles.rcForm__wrapper} fp-col`}>
        <div className={`${styles.rcForm__block} fp-col`}>
          <div className={`${styles.rcForm__step} h4 fp`}>
            <span className={styles.icon}>1 of 5</span>Name & Logo
          </div>
          <section className={`${styles.rcForm__section} bradius-m fp-col`}>
            <div className={`inputRow fp-col`}>
              <label htmlFor="name" className={`rcForm__label h5`}>
                Name of the run club <span className="rcForm__required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="E.g. Kesklinna Jooksuklubi"
                defaultValue={initialValues?.name || ""}
                required
                className={`rcForm__input h5`}
                aria-invalid={!!(state && !state.success && state.errors?.name)}
              />
              {state && !state.success && state.errors?.name && (
                <p id="name-error" className="rcForm__hint" role="alert">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            {showExistingLogo && (
              <div className={styles.existingLogo + " fp-col"}>
                <label htmlFor="logo" className={`rcForm__label h5`}>
                  Current logo
                </label>
                <div style={{ position: "relative", display: "inline-block" }}>
                    <Image
                    src={existingLogoUrl}
                    alt="Current logo"
                    style={{ maxWidth: "250px", maxHeight: "250px", borderRadius: "0.8rem", objectFit: "cover" }}
                    loading="lazy"
                    width={250}
                    height={250}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveExistingLogo}
                    className={styles.removeLogoBtn + " fp"}
                    aria-label="Remove current logo"
                  >
                    <LucideX size={16} color="white" />
                  </button>
                </div>
                <p className="txt-small" style={{ marginTop: "0.5rem", opacity: 0.7 }}>
                  Upload a new image below to replace the current logo
                </p>
              </div>
            )}

            <label htmlFor="logo" className={`rcForm__label h5`}>
              Logo <span className={styles.small}>(JPG, PNG, WEBP, SVG, max 5MB)</span>
            </label>
            <div className={`inputRow inputRow__file fp-col`}>
              <span className={`rcForm__label h5`}>Drop your file here or...</span>
              <div className={`rcForm__uploadBtn btn_main`}>
                Select file
                <div className={`icon fp`}>
                  <LucideUpload size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
                </div>
              </div>
              <input
                id="logo"
                name="logo"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                className="rcForm__file"
                onChange={handleFileChange}
              />
              {fileError && (
                <p id="logo-error" className="rcForm__hint" role="alert">
                  {fileError}
                </p>
              )}
              {filePreview && (
                <div style={{ marginTop: "0.8rem" }}>
                  <Image
                    src={filePreview || initialValues?.logo || ""}
                    alt="Logo preview"
                    style={{ maxWidth: "250px", maxHeight: "250px", borderRadius: "0.8rem", objectFit: "cover" }}
                    loading="lazy"
                    width={250}
                    height={250}
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <div className={`${styles.rcForm__step} h4 fp`}>
            <span className={styles.icon}>2 of 5</span>Location details
          </div>
          <section className={`${styles.rcForm__section} bradius-m fp-col`}>
            <div className={`inputRow fp-col`}>
              <label htmlFor="city" className={`rcForm__label h5`}>
                City <span className="rcForm__required">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                placeholder="E.g. Tallinn"
                defaultValue={initialValues?.city || ""}
                required
                className={`rcForm__input h5`}
                maxLength={256}
                aria-invalid={!!(state && !state.success && state.errors?.city)}
              />
              {state && !state.success && state.errors?.city && (
                <p id="city-error" className="rcForm__hint" role="alert">
                  {state.errors.city[0]}
                </p>
              )}
            </div>

            <div className={`inputRow fp-col`}>
              <label htmlFor="area" className={`rcForm__label h5`}>
                Where do you usually gather and start your runs? <span className="rcForm__required">*</span>
              </label>
              <input
                id="area"
                name="area"
                type="text"
                defaultValue={initialValues?.area || ""}
                placeholder="E.g. Rotermanni kvartal"
                required
                className={`rcForm__input h5`}
                maxLength={256}
                aria-invalid={!!(state && !state.success && state.errors?.area)}
              />
              {state && !state.success && state.errors?.area && (
                <p id="area-error" className="rcForm__hint" role="alert">
                  {state.errors.area[0]}
                </p>
              )}
            </div>

            <div className={`inputRow fp-col`}>
              <label htmlFor="address" className={`rcForm__label h5`}>
                Starting location address (if applicable)
              </label>
              <input
                id="address"
                name="address"
                type="text"
                defaultValue={initialValues?.address || ""}
                placeholder="E.g. Rotermanni 2, Tallinn"
                className={`rcForm__input h5`}
                maxLength={256}
              />
            </div>
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <div className={`${styles.rcForm__step} h4 fp`}>
            <span className={styles.icon}>3 of 5</span>Information about runs & schedule
          </div>
          <section className={`${styles.rcForm__section} bradius-m fp-col`}>
            <div className={`inputRow fp-col`}>
              <span className={`rcForm__label h5`}>
                What days do you usually run on? <span className="rcForm__required">*</span>
              </span>
              <div className={`rcForm__checkboxGroup fp-col`} role="group" aria-labelledby="runDays-label">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <label key={day} className={`rcForm__checkboxLabel txt-body`}>
                    <input 
                      type="checkbox" 
                      name="runDays" 
                      value={day} 
                      defaultChecked={initialValues?.runDays?.includes(day)} 
                      className="rcForm__checkbox" 
                      />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
              {state && !state.success && state.errors?.runDays && (
                <p id="runDays-error" className="rcForm__hint" role="alert">
                  {state.errors.runDays[0]}
                </p>
              )}
            </div>

            <div className={`inputRow fp-col`}>
              <label htmlFor="distance" className={`rcForm__label h5`}>
                How long are the runs on average? <span className="rcForm__required">*</span>
              </label>
              <input
                id="distance"
                name="distance"
                type="text"
                defaultValue={initialValues?.distance || ""}
                placeholder="E.g. 5-8 km"
                required
                className={`rcForm__input h5`}
                maxLength={256}
                aria-invalid={!!(state && !state.success && state.errors?.distance)}
              />
              {state && !state.success && state.errors?.distance && (
                <p id="distance-error" className="rcForm__hint" role="alert">
                  {state.errors.distance[0]}
                </p>
              )}
            </div>

            <div className={`textareaRow fp-col`}>
              <label htmlFor="distanceDescription" className={`rcForm__label h5`}>
                Describe the pace groups available (if any) and their average paces
              </label>
              <textarea
                id="distanceDescription"
                name="distanceDescription"
                placeholder="E.g. Two pace groups: slower 7-8 km, faster 9-11 km"
                rows={3}
                className="h5"
                maxLength={1000}
                defaultValue={initialValues?.distanceDescription || ""}
              />
            </div>

            <div className={`inputRow fp-col`}>
              <label htmlFor="startTime" className={`rcForm__label h5`}>
                At what time do the runs usually start?
              </label>
              <TimePicker
                id="startTime"
                label=""
                value={time || initialValues?.startTime || ""}
                onChange={handleTimeChange}
                is24Hour
                classes={{
                  container: styles.rcForm__timePicker,
                  timePicker: styles.pickerInput,
                  timeInput: styles.number,
                  timeTrigger: styles.trigger,
                  label: styles.rcForm__label,
                  popoverContent: styles.rcForm__pickerPopover,
                  popoverColumns: styles.rcForm__popoverColumns,
                  popoverColumn: styles.rcForm__popoverColumn,
                  popoverColumnTitle: styles.rcForm__popoverColTitle,
                  popoverItem: styles.rcForm__popoverItem,
                  popoverActiveItem: styles.popoverActiveItem,
                }}
              />
            </div>
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <div className={`${styles.rcForm__step} h4 fp`}>
            <span className={styles.icon}>4 of 5</span>Introduction
          </div>
          <section className={`${styles.rcForm__section} bradius-m fp-col`}>
            <div className={`textareaRow fp-col`}>
              <label htmlFor="description" className={`rcForm__label h5`}>
                Introduction <span className="rcForm__required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Introductory text describing your run club. Think of it as a first impression for potential new members. Please also point out the social channel where you post the most up-to-date information about runs & events."
                required
                rows={8}
                className="h5"
                maxLength={5000}
                defaultValue={initialValues?.description || ""}
                aria-invalid={!!(state && !state.success && state.errors?.description)}
              />
              {state && !state.success && state.errors?.description && (
                <p id="description-error" className="rcForm__hint" role="alert">
                  {state.errors.description[0]}
                </p>
              )}
            </div>
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <div className={`${styles.rcForm__step} h4 fp`}>
            <span className={styles.icon}>5 of 5</span>Contact & social media links
          </div>
          <section className={`${styles.rcForm__section} bradius-m fp-col`}>
            <div className={`inputRow fp-col`}>
              <label htmlFor="instagram" className={`rcForm__label h5`}>
                Instagram
              </label>
              <input
                id="instagram"
                name="instagram"
                type="url"
                defaultValue={initialValues?.instagram || ""}
                placeholder="https://instagram.com/..."
                className={`rcForm__input h5`}
                maxLength={2048}
              />
            </div>

            <div className={`inputRow fp-col`}>
              <label htmlFor="facebook" className={`rcForm__label h5`}>
                Facebook
              </label>
              <input
                id="facebook"
                name="facebook"
                type="url"
                defaultValue={initialValues?.facebook || ""}
                placeholder="https://facebook.com/..."
                className={`rcForm__input h5`}
                maxLength={2048}
              />
            </div>

            <div className={`inputRow fp-col`}>
              <label htmlFor="strava" className={`rcForm__label h5`}>
                Strava
              </label>
              <input
                id="strava"
                name="strava"
                type="url"
                defaultValue={initialValues?.strava || ""}
                placeholder="https://strava.com/clubs/..."
                className={`rcForm__input h5`}
                maxLength={2048}
              />
            </div>

            <div className={`inputRow fp-col`}>
              <label htmlFor="website" className={`rcForm__label h5`}>
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                defaultValue={initialValues?.website || ""}
                placeholder="https://..."
                className={`rcForm__input h5`}
                maxLength={2048}
              />
            </div>

            <div className={`inputRow fp-col`}>
              <label htmlFor="email" className={`rcForm__label h5`}>
                Contact person&apos;s email <span className="rcForm__required">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={initialValues?.email || ""}
                placeholder="contact@runclub.ee"
                required
                className={`rcForm__input h5`}
                maxLength={254}
                aria-invalid={!!(state && !state.success && state.errors?.email)}
              />
              {state && !state.success && state.errors?.email && (
                <p id="email-error" className="rcForm__hint" role="alert">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <button
        type="submit"
        className={`rcForm__submit btn_main white white--alt`}
        data-umami-event={mode === "create" ? "Submitted Run Club Registration Form" : "Updated Run Club"}
        disabled={isPending || !!fileError}
        style={{
          opacity: isPending || fileError ? 0.6 : 1,
          cursor: isPending || fileError ? "not-allowed" : "pointer",
        }}
      >
         {isPending ? (mode === "create" ? "Submitting..." : "Updating...") : (mode === "create" ? "Submit form" : "Update club")}
      </button>
    </form>
  );
}
