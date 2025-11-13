"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import styles from "./RunClubRegistrationForm.module.css";
import FormToast from "../Toast/Toast";
import { LucideUpload } from "lucide-react";
import { createRunClub } from "@/app/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TimePicker, { TimePickerValue } from "react-accessible-time-picker";

// Match server action's return type
type FormState =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      errors?: Record<string, string[]>;
      fieldValues?: Record<string, unknown>;
    }
  | undefined;

const initialState: FormState = undefined;

export default function RunClubRegistrationForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [countdown, setCountdown] = useState<number | null>(null);

  // Feedback toast state
  const [toastOpen, setToastOpen] = useState(false);
  // Form and file input refs
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // File preview and error states
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  // TimePicker state
  const [time, setTime] = useState({ hour: '', minute: ''});

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
      setFilePreview(null);
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
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // Format time as HH:MM
    const formattedTime = time.hour && time.minute 
    ? `${time.hour.padStart(2, '0')}:${time.minute.padStart(2, '0')}`
    : '';
     formData.set('startTime', formattedTime);

    startTransition(async () => {
      try {
        const result = await createRunClub(state, formData);
        setState(result);

        if (result.success) {
          // Clear form on success
          if (formRef.current) {
            formRef.current.reset();
            setFilePreview(null);
            setFileError(null);
            handleTimeChange({ hour: '', minute: '' });
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }

          // Start countdown timer
          setCountdown(5);
          // Redirect after showing success message
          setTimeout(() => {
            router.push("/");
          }, 5000);
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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state?.message) {
      setToastOpen(true);
    }
  }, [state?.message]);

  if (!mounted) {
    return (
      <div
        style={{
          maxWidth: "42rem",
          margin: "0 auto",
          padding: "2rem 1rem",
        }}
      >
        <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Submit a new running club to Run Clubs Estonia</h2>
        <p style={{ color: "#64748b" }} className="txt-body">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} ref={formRef} className={`${styles.rcForm} fp-col`}>
      {state?.message && (
        <FormToast
          message={
            state.success && countdown !== null && countdown > 0
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
        <h1 className={styles.rcForm__title}>Register a new running club</h1>
        <p>Fill out the form below to submit your club to our list.</p>
        <p>
          Please feel free to answer in <strong>Estonian</strong> or <strong>English</strong> as you prefer.
        </p>
      </div>

      <p>
        <i>
          All fields marked with <strong>*</strong> are <strong>required</strong>
        </i>
      </p>

      <div className={`${styles.rcForm__wrapper} fp-col`}>
        <div className={`${styles.rcForm__block} fp-col`}>
          <div className={`${styles.rcForm__step} h4 fp`}><span className={styles.icon}>1 of 5</span>Name & Logo</div>
          <section className={`${styles.rcForm__section} fp-col`}>
            <div className={`${styles.customInput} fp-col`}>
              <label htmlFor="name" className={`${styles.rcForm__label} h5`}>
                Name of the run club <span>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="E.g. Kesklinna Jooksuklubi"
                required
                className={`${styles.rcForm__input} h5`}
                aria-invalid={!!(state && !state.success && state.errors?.name)}
              />
              {state && !state.success && state.errors?.name && (
                <p id="name-error" className={styles.rcForm__hint} role="alert">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            <div className={`${styles.customInput} ${styles.customInput__file} fp-col`}>
              <label htmlFor="logo" className={`${styles.rcForm__label} h5`}>
                Logo (JPG, PNG, WEBP, SVG,  max 5MB)
              </label>
              <div className={styles.rcForm__uploadIcon}>
                <LucideUpload size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
              </div>
              <input
                id="logo"
                name="logo"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                className={styles.rcForm__file}
                onChange={handleFileChange}
              />
              {fileError && (
                <p id="logo-error" className={styles.rcForm__hint} role="alert">
                  {fileError}
                </p>
              )}
              {filePreview && (
                <div style={{ marginTop: "0.8rem" }}>
                  <Image
                    src={filePreview}
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
          <div className={`${styles.rcForm__step} h4 fp`}><span className={styles.icon}>2 of 5</span>Location details</div>
            <section className={`${styles.rcForm__section} fp-col`}>
              <div className={`${styles.customInput} fp-col`}>
                <label htmlFor="city" className={`${styles.rcForm__label} h5`}>
                  City <span>*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="E.g. Tallinn"
                  required
                  className={`${styles.rcForm__input} h5`}
                  maxLength={256}
                  aria-invalid={!!(state && !state.success && state.errors?.city)}
                />
                {state && !state.success && state.errors?.city && (
                  <p id="city-error" className={styles.rcForm__hint} role="alert">
                    {state.errors.city[0]}
                  </p>
                )}
              </div>

              <div className={`${styles.customInput} fp-col`}>
                <label htmlFor="area" className={`${styles.rcForm__label} h5`}>
                  Where do you usually gather and start your runs? <span>*</span>
                </label>
                <input
                  id="area"
                  name="area"
                  type="text"
                  placeholder="E.g. Rotermanni kvartal"
                  required
                  className={`${styles.rcForm__input} h5`}
                  maxLength={256}
                  aria-invalid={!!(state && !state.success && state.errors?.area)}
                />
                {state && !state.success && state.errors?.area && (
                  <p id="area-error" className={styles.rcForm__hint} role="alert">
                    {state.errors.area[0]}
                  </p>
                )}
              </div>

              <div className={`${styles.customInput} fp-col`}>
                <label htmlFor="address" className={`${styles.rcForm__label} h5`}>
                  Starting location address (if applicable)
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="E.g. Rotermanni 2, Tallinn"
                  className={`${styles.rcForm__input} h5`}
                  maxLength={256}
                />
              </div>
            </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <div className={`${styles.rcForm__step} h4 fp`}><span className={styles.icon}>3 of 5</span>Information about runs & schedule</div>
          <section className={`${styles.rcForm__section} fp-col`}>
            <div className={`${styles.customInput} fp-col`}>
              <span className={`${styles.rcForm__label} h5`}>What days do you usually run on? <span>*</span></span>
              <div className={`${styles.rcForm__checkboxGroup} fp-col`} role="group" aria-labelledby="runDays-label">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <label key={day} className={`${styles.rcForm__checkboxLabel} txt-body`}>
                    <input
                      type="checkbox"
                      name="runDays"
                      value={day}
                      className={styles.rcForm__checkbox}
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
              {state && !state.success && state.errors?.runDays && (
                <p id="runDays-error" className={styles.rcForm__hint} role="alert">
                  {state.errors.runDays[0]}
                </p>
              )}
            </div>

            <div className={`${styles.customInput} fp-col`}>
              <label htmlFor="distance" className={`${styles.rcForm__label} h5`}>
                How long are the runs on average? <span>*</span>
              </label>
              <input
                id="distance"
                name="distance"
                type="text"
                placeholder="E.g. 5-8 km"
                required
                className={`${styles.rcForm__input} h5`}
                maxLength={256}
                aria-invalid={!!(state && !state.success && state.errors?.distance)}
              />
              {state && !state.success && state.errors?.distance && (
                <p id="distance-error" className={styles.rcForm__hint} role="alert">
                  {state.errors.distance[0]}
                </p>
              )}
            </div>

            <div className={`${styles.customTextArea} fp-col`}>
              <label htmlFor="distanceDescription" className={`${styles.rcForm__label} h5`}>
                Describe the pace groups available (if any) and their average paces
              </label>
              <textarea
                id="distanceDescription"
                name="distanceDescription"
                placeholder="E.g. Two pace groups: slower 7-8 km, faster 9-11 km"
                rows={3}
                className="h5"
                maxLength={1000}
              />
            </div>

            <div className={`${styles.customInput} fp-col`}>
              <label htmlFor="startTime" className={`${styles.rcForm__label} h5`}>
                At what time do the runs usually start?
              </label>
              <TimePicker 
                id="startTime"
                label=""
                value={time}
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
          <div className={`${styles.rcForm__step} h4 fp`}><span className={styles.icon}>4 of 5</span>Introduction</div>
          <section className={`${styles.rcForm__section} fp-col`}>
            <div className={`${styles.customTextArea} fp-col`}>
              <label htmlFor="description" className={`${styles.rcForm__label} h5`}>
                Introduction <span>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Introductory text describing your run club. Think of it as a first impression for potential new members. Please also point out the social channel where you post the most up-to-date information about runs & events."
                required
                rows={8}
                className="h5"
                maxLength={5000}
                aria-invalid={!!(state && !state.success && state.errors?.description)}
              />
              {state && !state.success && state.errors?.description && (
                <p id="description-error" className={styles.rcForm__hint} role="alert">
                  {state.errors.description[0]}
                </p>
              )}
            </div>
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <div className={`${styles.rcForm__step} h4 fp`}><span className={styles.icon}>5 of 5</span>Contact & social media links</div>
          <section className={`${styles.rcForm__section} fp-col`}>
            <div className={`${styles.customInput} fp-col`}>
              <label htmlFor="instagram" className={`${styles.rcForm__label} h5`}>
                Instagram
              </label>
              <input
                id="instagram"
                name="instagram"
                type="url"
                placeholder="https://instagram.com/..."
                className={`${styles.rcForm__input} h5`}
                maxLength={2048}
              />
            </div>

            <div className={`${styles.customInput} fp-col`}>
              <label htmlFor="facebook" className={`${styles.rcForm__label} h5`}>
                Facebook
              </label>
              <input
                id="facebook"
                name="facebook"
                type="url"
                placeholder="https://facebook.com/..."
                className={`${styles.rcForm__input} h5`}
                maxLength={2048}
              />
            </div>

            <div className={`${styles.customInput} fp-col`}>
              <label htmlFor="strava" className={`${styles.rcForm__label} h5`}>
                Strava
              </label>
              <input
                id="strava"
                name="strava"
                type="url"
                placeholder="https://strava.com/clubs/..."
                className={`${styles.rcForm__input} h5`}
                maxLength={2048}
              />
            </div>

            <div className={`${styles.customInput} fp-col`}>
              <label htmlFor="website" className={`${styles.rcForm__label} h5`}>
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                placeholder="https://..."
                className={`${styles.rcForm__input} h5`}
                maxLength={2048}
              />
            </div>

            <div className={`${styles.customInput} fp-col`}>
              <label htmlFor="email" className={`${styles.rcForm__label} h5`}>
                Contact person&apos;s email <span>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="contact@runclub.ee"
                required
                className={`${styles.rcForm__input} h5`}
                maxLength={254}
                aria-invalid={!!(state && !state.success && state.errors?.email)}
              />
              {state && !state.success && state.errors?.email && (
                <p id="email-error" className={styles.rcForm__hint} role="alert">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <button
        type="submit"
        className={`${styles.rcForm__submit} btn_main white white--alt`}
        data-umami-event="Submitted Run Club Registration Form"
        disabled={isPending || !!fileError}
        style={{
          opacity: isPending || fileError ? 0.6 : 1,
          cursor: isPending || fileError ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? "Submitting..." : "Submit form"}
      </button>
    </form>
  );
}
