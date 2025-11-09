"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./RunClubRegistrationForm.module.css";
import FormToast from "../Toast/Toast";
import { Form } from "radix-ui";
import { LucideUpload } from "lucide-react";

type FieldErrors = Record<string, string[] | undefined>;
type FormState = {
  success: boolean;
  errors: FieldErrors;
  message?: string;
};


function fieldErr(errors: FieldErrors, name: string) {
  const msgs = errors?.[name];
  return msgs?.length ? msgs.join(", ") : undefined;
}

export default function RunClubRegistrationForm() {
  const [mounted, setMounted] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [state, setState] = useState<FormState>({ success: false, errors: {} });
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

 const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/register-runclub", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      const nextState: FormState = {
        success: response.ok,
        errors: response.ok ? {} : result.errors ?? {},
        message:
          result.message ??
          result.error ??
          (response.ok
            ? "Success! Your registration has been received and is pending approval."
            : "An error occurred. Please try again."),
      };

      setState(nextState);
      setToastOpen(Boolean(nextState.message));

      if (response.ok) {
        form.reset();
      }
    } catch {
      const fallback: FormState = {
        success: false,
        errors: {},
        message:
          "An error occurred during registration. Please check your internet connection and try again.",
      };
      setState(fallback);
      setToastOpen(true);
    }
  };


  // Show toast when state changes
  useEffect(() => {
    if (state.message) {
      setToastOpen(true);
    }
  }, [state.message, state.success]);


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
     <Form.Root
      ref={formRef}
      onSubmit={handleSubmit}
      className={`${styles.rcForm} fp-col`}
      onClearServerErrors={() => setState((prev) => ({ ...prev, errors: {} }))}
    >
      {state.message && (
        <FormToast
          message={state.message}
          type={state.success ? "success" : "error"}
          open={toastOpen}
          onOpenChange={setToastOpen}
        />
      )}

      <div className={styles.rcForm__header}>
        <h1 className={styles.rcForm__title}>Register a new running club</h1>
        <p>Fill out the form below to submit your club to our list.</p>
        <p>
          Please feel free to answer in <strong>Estonian</strong> or{" "}
          <strong>English</strong> as you prefer.
        </p>
      </div>

      <div className={`${styles.rcForm__wrapper} fp-col`}>
        <p>
          <i>
            All fields marked with <strong>*</strong> are <strong>required</strong>
          </i>
        </p>

        <div className={`${styles.rcForm__block} fp-col`}>
          <span className={`${styles.rcForm__step} txt-body`}>Step 1 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>Name & Logo</h3>

            <Form.Field name="name" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>
                Name of the run club *
              </Form.Label>
              <Form.Control asChild>
                <input
                  type="text"
                  placeholder="E.g. Kesklinna Jooksuklubi"
                  required
                  className={`${styles.rcForm__input} h5`}
                  aria-invalid={!!fieldErr(state.errors, "name")}
                />
              </Form.Control>
              <Form.Message className={styles.rcForm__hint} match="valueMissing">
                This field is required.
              </Form.Message>
            </Form.Field>

            <Form.Field name="logo" className={`${styles.customInput} ${styles.customInput__file} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>
                Logo (JPG, PNG, WEBP, max 5MB)
              </Form.Label>
              <div className={styles.rcForm__uploadIcon}>
                <LucideUpload size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
              </div>
                <Form.Control asChild>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className={styles.rcForm__file}
                  />
                </Form.Control>
            </Form.Field>
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <span className={`${styles.rcForm__step} txt-body`}>Step 2 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>Information about runs & schedule</h3>

            <Form.Field name="runDays" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>
                What days do you usually run on? *
              </Form.Label>
              <Form.Control asChild>
                <input
                  type="text"
                  placeholder="E.g. Tuesday, Thursday"
                  required
                  className={`${styles.rcForm__input} h5`}
                />
              </Form.Control>
              <Form.Message className={styles.rcForm__hint} match="valueMissing">
                This field is required.
              </Form.Message>
            </Form.Field>

            <Form.Field name="distance" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>
                How long are the runs on average? *
              </Form.Label>
              <Form.Control asChild>
                <input
                  type="text"
                  placeholder="E.g. 5-8 km"
                  required
                  className={`${styles.rcForm__input} h5`}
                />
              </Form.Control>
              <Form.Message className={styles.rcForm__hint} match="valueMissing">
                This field is required.
              </Form.Message>
            </Form.Field>

            <Form.Field
              name="distanceDescription"
              className={`${styles.customTextArea} fp-col`}
            >
              <Form.Label className={`${styles.rcForm__label} h4`}>
                Describe the pace groups available (if any) and their average paces
              </Form.Label>
              <Form.Control asChild>
                <textarea
                  placeholder="E.g. Two pace groups: slower 7-8 km, faster 9-11 km"
                  rows={3}
                  className="h5"
                />
              </Form.Control>
            </Form.Field>

            <Form.Field name="startTime" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>
                At what time do the runs usually start? *
              </Form.Label>
              <Form.Control asChild>
                <input
                  type="text"
                  placeholder="E.g. 18:30"
                  required
                  className={`${styles.rcForm__input} h5`}
                  aria-invalid={!!fieldErr(state.errors, "startTime")}
                />
              </Form.Control>
              <Form.Message className={styles.rcForm__hint} match="valueMissing">
                This field is required.
              </Form.Message>
            </Form.Field>
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <span className={`${styles.rcForm__step} txt-body`}>Step 3 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>Location details</h3>

            <Form.Field name="city" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>City *</Form.Label>
              <Form.Control asChild>
                <input
                  type="text"
                  placeholder="E.g. Tallinn"
                  required
                  className={`${styles.rcForm__input} h5`}
                  aria-invalid={!!fieldErr(state.errors, "city")}
                />
              </Form.Control>
              <Form.Message className={styles.rcForm__hint} match="valueMissing">
                This field is required.
              </Form.Message>
            </Form.Field>

            <Form.Field name="area" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>
                Where do you usually gather and start your runs? *
              </Form.Label>
              <Form.Control asChild>
                <input
                  type="text"
                  placeholder="E.g. Rotermanni kvartal"
                  required
                  className={`${styles.rcForm__input} h5`}
                />
              </Form.Control>
              <Form.Message className={styles.rcForm__hint} match="valueMissing">
                This field is required.
              </Form.Message>
            </Form.Field>

            <Form.Field name="address" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>
                Starting location address (if applicable)
              </Form.Label>
              <Form.Control asChild>
                <input
                  type="text"
                  placeholder="E.g. Rotermanni 2, Tallinn"
                  className={`${styles.rcForm__input} h5`}
                />
              </Form.Control>
            </Form.Field>
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <span className={`${styles.rcForm__step} txt-body`}>Step 4 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>Introduction</h3>

            <Form.Field name="description" className={`${styles.customTextArea} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>Introduction *</Form.Label>
              <Form.Control asChild>
                <textarea
                  placeholder="Describe your running club..."
                  required
                  rows={6}
                  className="h5"
                />
              </Form.Control>
              <Form.Message className={styles.rcForm__hint} match="valueMissing">
                This field is required.
              </Form.Message>
            </Form.Field>
          </section>
        </div>

        <div className={`${styles.rcForm__block} fp-col`}>
          <span className={`${styles.rcForm__step} txt-body`}>Step 5 of 5</span>
          <section className={`${styles.rcForm__section} fp-col`}>
            <h3>Contact & social media links</h3>

            <Form.Field name="instagram" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>Instagram</Form.Label>
              <Form.Control asChild>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  className={`${styles.rcForm__input} h5`}
                />
              </Form.Control>
            </Form.Field>

            <Form.Field name="facebook" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>Facebook</Form.Label>
              <Form.Control asChild>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  className={`${styles.rcForm__input} h5`}
                />
              </Form.Control>
            </Form.Field>

            <Form.Field name="strava" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>Strava</Form.Label>
              <Form.Control asChild>
                <input
                  type="url"
                  placeholder="https://strava.com/clubs/..."
                  className={`${styles.rcForm__input} h5`}
                />
              </Form.Control>
            </Form.Field>

            <Form.Field name="website" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>Website</Form.Label>
              <Form.Control asChild>
                <input
                  type="url"
                  placeholder="https://..."
                  className={`${styles.rcForm__input} h5`}
                  aria-invalid={!!fieldErr(state.errors, "website")}
                />
              </Form.Control>
            </Form.Field>

            <Form.Field name="email" className={`${styles.customInput} fp-col`}>
              <Form.Label className={`${styles.rcForm__label} h4`}>
                Contact person's email *
              </Form.Label>
              <Form.Control asChild>
                <input
                  type="email"
                  placeholder="contact@runclub.ee"
                  required
                  className={`${styles.rcForm__input} h5`}
                />
              </Form.Control>
              <Form.Message className={styles.rcForm__hint} match="typeMismatch">
                This email address is not valid.
              </Form.Message>
            </Form.Field>
          </section>
        </div>
      </div>

      <Form.Submit asChild>
        <button
          className={`${styles.rcForm__submit} btn_main white`}
          data-umami-event="Submitted Run Club Registration Form"
        >
          Submit form
        </button>
      </Form.Submit>
    </Form.Root>
  );
}