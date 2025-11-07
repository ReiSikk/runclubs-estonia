"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CustomInput, CustomTextarea } from "./CustomInputs";
import styles from "./RunClubRegistrationForm.module.css";

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
    >
      {pending ? "Saatmine..." : "Registreeri klubi"}
    </button>
  );
}

export default function RunClubRegistrationForm() {
  const [mounted, setMounted] = useState(false);
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
            message: result.error || "Viga registreerimisel. Palun proovi uuesti.",
          };
        }

        return {
          success: true,
          errors: {},
          message: result.message || "Edu! Registreerimine laekus ja ootab kinnitamist.",
        };
      } catch {
        return {
          success: false,
          errors: {},
          message: "Viga registreerimisel. Palun kontrolli internetiühendust ja proovi uuesti.",
        };
      }
    },
    initialState
  );

  // Only reset form on success
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
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.875rem", fontWeight: 700 }}>
          Registreeri oma jooksuklubi
        </h2>
        <p style={{ color: "#64748b" }}>Laadib vormi...</p>
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
      {/* Header */}
      <div style={{ marginBottom: "1rem" }}>
        <h1 style={{
          marginBottom: "0.5rem",
        }}>
          Registreeri oma jooksuklubi
        </h1>
        <p>
          Täida allolev vorm ja ootame sinu klubit meie nimekirja.
        </p>
      </div>

      {/* Error message */}
      {!state.success && state.message && (
        <div style={{
          padding: "1rem 1.25rem",
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderRadius: "0.5rem",
          border: "1px solid #fecaca",
          fontSize: "0.875rem",
        }}>
          {state.message}
        </div>
      )}

      {/* Success message */}
      {state.success && (
        <div style={{
          padding: "1rem 1.25rem",
          backgroundColor: "#f0fdf4",
          color: "#166534",
          borderRadius: "0.5rem",
          border: "1px solid #bbf7d0",
          fontSize: "0.875rem",
        }}>
          {state.message ?? "Edu! Registreerimine laekus ja ootab kinnitamist."}
        </div>
      )}

      <section className={`${styles.rcForm__section} fp-col`}>
        <h3>
          Põhiinfo
        </h3>

        <CustomInput
          label="Klubi nimi *"
          name="name"
          required
          placeholder="Näiteks: Tallinna Jooksuklubi"
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

      <section className={`${styles.rcForm__section} fp-col`}>
        <h3>
          Jooksude info
        </h3>

        <CustomInput
          label="Mis päevadel tavaliselt jooksete? *"
          name="runDays"
          placeholder="Näiteks: Teisipäev, Neljapäev"
          required
          aria-invalid={!!fieldErr(state.errors, "runDays")}
          error={fieldErr(state.errors, "runDays")}
        />

        <CustomInput
          label="Kui pikad on jooksud keskmiselt? *"
          name="distance"
          placeholder="Näiteks: 5-8 km"
          required
          aria-invalid={!!fieldErr(state.errors, "distance")}
          error={fieldErr(state.errors, "distance")}
        />

        <CustomTextarea
          label="Lühikirjeldus distantsidest"
          name="distanceDescription"
          placeholder="Nt: Vähemalt kahes erinevas tempo grupis: rahulikum grupp 7-8km ja kiirem grupp 9-11km"
          rows={3}
          aria-invalid={!!fieldErr(state.errors, "distanceDescription")}
          error={fieldErr(state.errors, "distanceDescription")}
        />

        <CustomInput
          label="Mis kellaajal algavad jooksud? *"
          name="startTime"
          placeholder="Näiteks: 18:30"
          required
          aria-invalid={!!fieldErr(state.errors, "startTime")}
          error={fieldErr(state.errors, "startTime")}
        />
      </section>

      <section className={`${styles.rcForm__section} fp-col`}>
        <h3>
          Asukoht
        </h3>

        <CustomInput
          label="Linn *"
          name="city"
          placeholder="Näiteks: Tallinn"
          required
          aria-invalid={!!fieldErr(state.errors, "city")}
          error={fieldErr(state.errors, "city")}
        />

        <CustomInput
          label="Kogunemisala *"
          name="area"
          placeholder="Näiteks: Vabaduse väljak"
          required
          aria-invalid={!!fieldErr(state.errors, "area")}
          error={fieldErr(state.errors, "area")}
        />

        <CustomInput
          label="Alguskoha aadress (kui sama koht)"
          name="address"
          placeholder="Näiteks: Vabaduse väljak 1, Tallinn"
          aria-invalid={!!fieldErr(state.errors, "address")}
          error={fieldErr(state.errors, "address")}
        />
      </section>

      <section className={`${styles.rcForm__section} fp-col`}>
        <h3>
          Tutvustus
        </h3>

        <CustomTextarea
          label="Klubi tutvustus *"
          name="description"
          placeholder="Kirjelda oma jooksuklubi, selle õhkkonda ja kultuuri..."
          required
          rows={6}
          aria-invalid={!!fieldErr(state.errors, "description")}
          error={fieldErr(state.errors, "description")}
        />
      </section>

      <section className={`${styles.rcForm__section} fp-col`}>
        <h3>
          Sotsiaalmeedia ja kontakt
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
          label="Veebisait"
          name="website"
          placeholder="https://..."
          aria-invalid={!!fieldErr(state.errors, "website")}
          error={fieldErr(state.errors, "website")}
        />

        <CustomInput
          label="Kontakt e-post *"
          name="email"
          type="email"
          placeholder="kontakt@jooksuklubi.ee"
          required
          aria-invalid={!!fieldErr(state.errors, "email")}
          error={fieldErr(state.errors, "email")}
        />
      </section>

      <SubmitButton />
    </form>
  );
}