"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import styles from "./RunClubRegistrationForm.module.css";
import FormToast from "../Toast/Toast";
import { LucideUpload } from "lucide-react";
import { createRunClub } from "@/app/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { set } from "zod";

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFilePreview(null);
      setFileError(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    // Validate file size
    if (file.size > maxSize) {
      setFileError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 5MB.`);
      setFilePreview(null);
      event.target.value = "";
      return;
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setFileError("Accepted formats: JPG, JPEG, PNG, WEBP.");
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
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }

          // Start countdown for redirect
          setCountdown(3);
          // Redirect after showing success message
          setTimeout(() => {
            router.push("/");
          }, 2000);
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
              ? `${state.message} Redirecting in ${countdown}...`
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
          <span className={`${styles.rcForm__step} txt-body`}>Step 1 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>Name & Logo</h3>

            <div className={`${styles.customInput} fp-col`}>
              <label htmlFor="name" className={`${styles.rcForm__label} h4`}>
                Name of the run club *
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
              <label htmlFor="logo" className={`${styles.rcForm__label} h4`}>
                Logo (JPG, PNG, WEBP, max 5MB)
              </label>
              <div className={styles.rcForm__uploadIcon}>
                <LucideUpload size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
              </div>
              <input
                id="logo"
                name="logo"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
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
          <span className={`${styles.rcForm__step} txt-body`}>Step 2 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>Information about runs & schedule</h3>

            <div className={`${styles.customInput} fp-col`}>
              <span className={`${styles.rcForm__label} h4`}>What days do you usually run on? *</span>
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
              <label htmlFor="distance" className={`${styles.rcForm__label} h4`}>
                How long are the runs on average? *
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
              <label htmlFor="distanceDescription" className={`${styles.rcForm__label} h4`}>
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
              <label htmlFor="startTime" className={`${styles.rcForm__label} h4`}>
                At what time do the runs usually start? *
              </label>
              <input
                id="startTime"
                name="startTime"
                type="text"
                placeholder="E.g. 18:30"
                required
                className={`${styles.rcForm__input} h5`}
                maxLength={256}
                aria-invalid={!!(state && !state.success && state.errors?.startTime)}
              />
              {state && !state.success && state.errors?.startTime && (
                <p id="startTime-error" className={styles.rcForm__hint} role="alert">
                  {state.errors.startTime[0]}
                </p>
              )}
            </div>
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <span className={`${styles.rcForm__step} txt-body`}>Step 3 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>Location details</h3>

            <div className={`${styles.customInput} fp-col`}>
              <label htmlFor="city" className={`${styles.rcForm__label} h4`}>
                City *
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
              <label htmlFor="area" className={`${styles.rcForm__label} h4`}>
                Where do you usually gather and start your runs? *
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
              <label htmlFor="address" className={`${styles.rcForm__label} h4`}>
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
          <span className={`${styles.rcForm__step} txt-body`}>Step 4 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>Introduction</h3>

            <div className={`${styles.customTextArea} fp-col`}>
              <label htmlFor="description" className={`${styles.rcForm__label} h4`}>
                Introduction *
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your running club..."
                required
                rows={6}
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
          <span className={`${styles.rcForm__step} txt-body`}>Step 5 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>Contact & social media links</h3>

            <div className={`${styles.customInput} fp-col`}>
              <label htmlFor="instagram" className={`${styles.rcForm__label} h4`}>
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
              <label htmlFor="facebook" className={`${styles.rcForm__label} h4`}>
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
              <label htmlFor="strava" className={`${styles.rcForm__label} h4`}>
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
              <label htmlFor="website" className={`${styles.rcForm__label} h4`}>
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
              <label htmlFor="email" className={`${styles.rcForm__label} h4`}>
                Contact person&apos;s email *
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
        className={`${styles.rcForm__submit} btn_main white`}
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
