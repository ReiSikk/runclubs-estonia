"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { runClubSchema } from "@/app/lib/types/submitRunClub";
import { CustomInput, CustomTextarea } from "./CustomInputs";

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
      className="btn_main"
      style={{
        opacity: pending ? 0.6 : 1,
        cursor: pending ? "not-allowed" : "pointer",
      }}
    >
      {pending ? "Saatmine..." : "Registreeri klubi"}
    </button>
  );
}

export default function RunClubRegistrationForm() {
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const [state, formAction] = useActionState<FormState, FormData>(async (_prev, formData) => {
    try {
    //   const logo = formData.get("logo") as File;
      const values = {
        name: formData.get("name"),
        // logo: logo?.size > 0 ? logo : undefined,
        runDays: formData.get("runDays"),
        distance: formData.get("distance"),
        distanceDescription: formData.get("distanceDescription"),
        startTime: formData.get("startTime"),
        city: formData.get("city"),
        area: formData.get("area"),
        address: formData.get("address") || undefined,
        description: formData.get("description"),
        instagram: formData.get("instagram") || undefined,
        facebook: formData.get("facebook") || undefined,
        strava: formData.get("strava") || undefined,
        website: formData.get("website") || undefined,
        email: formData.get("email"),
      };

      const parsed = runClubSchema.safeParse(values);
      if (!parsed.success) {
        return { 
          success: false, 
          errors: parsed.error.flatten().fieldErrors,
          message: "Palun kontrolli sisestatud andmeid."
        };
      }

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
        message: "Edu! Registreerimine laekus ja ootab kinnitamist.",
      };
    } catch {
      return {
        success: false,
        errors: {},
        message: "Viga registreerimisel. Palun kontrolli internetiühendust ja proovi uuesti.",
      };
    }
  }, initialState);

  // Reset form on success
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [state.success]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div style={{ 
        maxWidth: 600, 
        margin: "2rem auto", 
        display: "flex", 
        flexDirection: "column", 
        gap: "1.5rem" 
      }}>
        <h2>Registreeri oma jooksuklubi</h2>
        <p>Laadib vormi...</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      style={{ 
        maxWidth: 600, 
        margin: "2rem auto", 
        display: "flex", 
        flexDirection: "column", 
        gap: "1.5rem" 
      }}
      noValidate
    >
      <h2>Registreeri oma jooksuklubi</h2>
      
      {/* General error message */}
      {!state.success && state.message && (
        <div style={{ 
          padding: "1rem", 
          background: "#fee", 
          color: "#c00", 
          borderRadius: "0.5rem",
          border: "1px solid #c00"
        }}>
          {state.message}
        </div>
      )}

      {/* Success message */}
      {state.success && (
        <div style={{ 
          padding: "1rem", 
          background: "#efe", 
          color: "#060", 
          borderRadius: "0.5rem",
          border: "1px solid #060"
        }}>
          {state.message ?? "Edu! Registreerimine laekus ja ootab kinnitamist."}
        </div>
      )}

      <CustomInput 
        label="Klubi nimi *" 
        name="name" 
        required 
        aria-invalid={!!fieldErr(state.errors, "name")}
        error={fieldErr(state.errors, "name")}
      />

      {/* <CustomInput
        label="Logo (JPG, PNG, WEBP, max 5MB)"
        name="logo"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        ref={fileRef}
        aria-invalid={!!fieldErr(state.errors, "logo")}
        error={fieldErr(state.errors, "logo")}
      /> */}

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
        label="Lühikirjeldus distantsistest" 
        name="distanceDescription" 
        placeholder="Nt: Vähemalt kahes erinevas tempo grupis: rahulikum grupp 7-8km ja kiirem grupp 9-11km"
        rows={5} 
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

      <CustomTextarea 
        label="Klubi tutvustus *" 
        name="description" 
        placeholder="Kirjelda oma jooksuklubi..."
        required 
        rows={5} 
        aria-invalid={!!fieldErr(state.errors, "description")}
        error={fieldErr(state.errors, "description")}
      />

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

      <SubmitButton />
    </form>
  );
}