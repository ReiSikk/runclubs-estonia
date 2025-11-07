"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CustomInput, CustomTextarea } from "./CustomInputs";
import styles from "./RunClubRegistrationForm.module.css";
import FormToast from "../Toast/Toast";

type FieldErrors = Record<string, string[] | undefined>;
type FormState =
  | { success: false; errors: FieldErrors; message?: string }
  | { success: true; errors: FieldErrors; message?: string };

const initialState: FormState = { success: false, errors: {} };

function fieldErr(errors: FieldErrors, name: string) {
  const msgs = errors?.[name];
  return msgs?.length ? msgs.join(", ") : undefined;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${styles.rcForm__submitButton} btn_main white`}
      style={{
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.7 : 1,
      }}
      aria-label="Submit form"
    >
      {pending ? "Saatmine..." : "Registreeri klubi"}
    </button>
  );
}

export default function RunClubRegistrationForm() {
  const [mounted, setMounted] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [state, formAction] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      try {
        // Send to API route
        const response = await fetch("/api/register-runclub", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          return {
            success: false,
            errors: result.errors || {},
            message: result.error || "An error occurred. Please try again.",
          };
        }

        return {
          success: true,
          errors: {},
          message: result.message || "Success! Your registration has been received and is pending approval.",
        };
      } catch {
        return {
          success: false,
          errors: {},
          message: "An error occurred during registration. Please check your internet connection and try again.",
        };
      }
    },
    initialState
  );


  // Show toast when state changes
  useEffect(() => {
    if (state.message) {
      setToastOpen(true);
    }
  }, [state.message]);


  // Reset form on success
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  if (!mounted) {
    return (
      <div style={{
        maxWidth: "42rem",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}>
        <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          Submit a new running club to Run Clubs Estonia
        </h2>
        <p style={{ color: "#64748b" }} className="txt-body">Loading...</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className={`${styles.rcForm} fp-col`}
    >
      <div className={styles.rcForm__header}>
        <h1 className={styles.rcForm__title}>
          Register a new running club
        </h1>
        <p>
          Fill out the form below to submit your club to our list.
        </p>
        <p>
          Please feel free to answer in <strong>Estonian</strong> or <strong>English</strong> as you prefer.
        </p>
      </div>

        {state.message && (
          <FormToast
            message={state.message}
            type={state.success ? "success" : "error"}
            open={toastOpen}
            onOpenChange={setToastOpen}
          />
        )}

      <div className={`${styles.rcForm__wrapper} fp-col`}>
        <p><i>All fields marked with <strong>*</strong> are <strong>required</strong></i></p>
        <div className={`${styles.rcForm__block} fp-col`}>
          <span className={`${styles.rcForm__step} txt-body`}>Step 1 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>
              Põhiinfo
            </h3>

            <CustomInput
              label="Name of the run club *"
              name="name"
              required
              placeholder="E.g.: Kesklinna Jooksuklubi"
              aria-invalid={!!fieldErr(state.errors, "name")}
              error={fieldErr(state.errors, "name")}
            />

            <CustomInput
              label="Logo (JPG, PNG, WEBP, max 5MB)"
              name="logo"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              aria-invalid={!!fieldErr(state.errors, "logo")}
              error={fieldErr(state.errors, "logo")}
            />
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <span className={`${styles.rcForm__step} txt-body`}>Step 2 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>
              Information about runs & schedule
            </h3>

            <CustomInput
              label="What days do you usually run on? *"
              name="runDays"
              placeholder="E.g. Tuesday, Thursday"
              required
              aria-invalid={!!fieldErr(state.errors, "runDays")}
              error={fieldErr(state.errors, "runDays")}
            />

            <CustomInput
              label="How long are the runs on average? You can also enter the distance as a range for example 5-8 km *"
              name="distance"
              placeholder="E.g 5-8 km"
              required
              aria-invalid={!!fieldErr(state.errors, "distance")}
              error={fieldErr(state.errors, "distance")}
            />

            <CustomTextarea
              label="Describe the pace groups available (if any) and their average paces (if known)"
              name="distanceDescription"
              placeholder="E.g. At least two different pace groups: slower group 7-8km and faster group 9-11km"
              rows={3}
              aria-invalid={!!fieldErr(state.errors, "distanceDescription")}
              error={fieldErr(state.errors, "distanceDescription")}
            />

            <CustomInput
              label="At what time do the runs usually start? * (If it varies, just answer ''Varies'')"
              name="startTime"
              placeholder="E.g. 18:30"
              required
              aria-invalid={!!fieldErr(state.errors, "startTime")}
              error={fieldErr(state.errors, "startTime")}
            />
          </section>
        </div>
        
        <div className={`${styles.rcForm__block} fp-col`}>
          <span className={`${styles.rcForm__step} txt-body`}>Step 3 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>
              Location details
            </h3>

            <CustomInput
              label="City *"
              name="city"
              placeholder="E.g. Tallinn"
              required
              aria-invalid={!!fieldErr(state.errors, "city")}
              error={fieldErr(state.errors, "city")}
            />

            <CustomInput
              label="The area where you usually gather and start your runs from *"
              name="area"
              placeholder="E.g. Rotermanni kvartal"
              required
              aria-invalid={!!fieldErr(state.errors, "area")}
              error={fieldErr(state.errors, "area")}
            />

            <CustomInput
              label="Starting location address (if applicable)"
              name="address"
              placeholder="E.g. Rotermanni 2, Tallinn"
              aria-invalid={!!fieldErr(state.errors, "address")}
              error={fieldErr(state.errors, "address")}
            />
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <span className={`${styles.rcForm__step} txt-body`}>Step 4 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>
              Introduction
            </h3>

            <CustomTextarea
              label="Introduction *"
              name="description"
              placeholder="Describe your running club, its atmosphere, and culture..."
              required
              rows={6}
              aria-invalid={!!fieldErr(state.errors, "description")}
              error={fieldErr(state.errors, "description")}
            />
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <span className={`${styles.rcForm__step} txt-body`}>Step 5 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>
              Contact & social media links
            </h3>

            <CustomInput
              label="Instagram"
              name="instagram"
              placeholder="https://instagram.com/..."
              aria-invalid={!!fieldErr(state.errors, "instagram")}
              error={fieldErr(state.errors, "instagram")}
            />

            <CustomInput
              label="Facebook"
              name="facebook"
              placeholder="https://facebook.com/..."
              aria-invalid={!!fieldErr(state.errors, "facebook")}
              error={fieldErr(state.errors, "facebook")}
            />

            <CustomInput
              label="Strava"
              name="strava"
              placeholder="https://strava.com/clubs/..."
              aria-invalid={!!fieldErr(state.errors, "strava")}
              error={fieldErr(state.errors, "strava")}
            />

            <CustomInput
              label="Website"
              name="website"
              placeholder="https://..."
              aria-invalid={!!fieldErr(state.errors, "website")}
              error={fieldErr(state.errors, "website")}
            />

            <CustomInput
              label="Contact person's email *"
              name="email"
              type="email"
              placeholder="contact@runclub.ee"
              required
              aria-invalid={!!fieldErr(state.errors, "email")}
              error={fieldErr(state.errors, "email")}
            />
          </section>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}