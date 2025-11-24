"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import styles from "../../dashboard/page.module.css";
import { LucideCalendarPlus } from "lucide-react";

type RunClubOption = {
  id: string;
  name?: string;
  title?: string;
};

type Props = {
  runclubId?: string; // optional single-runclub preselect
  runclubs?: RunClubOption[]; // optional list to populate a select
  onClose?: () => void;
};

export default function EventCreationForm({ runclubId, runclubs = [], onClose }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRunclub, setSelectedRunclub] = useState<string>(runclubId || runclubs[0]?.id || "");

  useEffect(() => {
    if (runclubId) {
      setSelectedRunclub(runclubId);
    } else if (runclubs.length > 0) {
      setSelectedRunclub(runclubs[0].id);
    }
  }, [runclubId, runclubs]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be signed in to create an event.");
      return;
    }

    const finalRunclubId = runclubId || selectedRunclub;
    if (!finalRunclubId) {
      setError("Please select a run club to create the event for.");
      return;
    }

    setIsSubmitting(true);
    try {
      const idToken = await user.getIdToken(true);

      const fd = new FormData(e.currentTarget);
      const payload = {
        title: String(fd.get("title") || "").trim(),
        date: String(fd.get("date") || ""), // ISO date (yyyy-mm-dd)
        startTime: String(fd.get("startTime") || ""),
        endTime: String(fd.get("endTime") || ""),
        locationName: String(fd.get("locationName") || ""),
        locationUrl: String(fd.get("locationUrl") || ""),
        about: String(fd.get("about") || ""),
        runclub_id: finalRunclubId,
      };

      const res = await fetch("/api/create-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed to create event");
      } else {
        if (onClose) {
          onClose();
          router.push(`/runclubs/${finalRunclubId}`);
        } else {
          router.push(`/runclubs/${finalRunclubId}`);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} rcForm fp-col`}>
      {error && (
        <p role="alert" className={styles.rcForm__hint}>
          {error}
        </p>
      )}

      <div className={`${styles.form__body} rcForm__block fp-col`}>
        <div className={styles.form__header + " rcForm__step h1 fp"}>
          <span className="icon">
            <LucideCalendarPlus size={32} />
          </span>{" "}
          Create an event
        </div>

        <section className={styles.form__section + " rcForm__section bradius-m fp-col"}>
          {/* Runclub select (only when multiple runclubs available and no preselected runclubId) */}
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
            </div>
          )}

          {/* hidden input when runclubId prop is provided */}
          {runclubId && <input type="hidden" name="runclub_id" value={runclubId} />}

          <div className="inputRow fp-col">
            <label htmlFor="title" className="rcForm__label">
              Event title <span className="rcForm__required">*</span>
            </label>
            <input id="title" name="title" required className="rcForm__input" maxLength={200} />
          </div>

          <div className="inputRow fp">
            <label htmlFor="date" className="rcForm__label">
              Date
            </label>
            <input id="date" name="date" type="date" required className="rcForm__input" />
          </div>

          <div className="inputRow col-2 fp">
            <div className={styles.form__timegroup + " fp-col"}>
              <label htmlFor="startTime" className="rcForm__label">
                Start
              </label>
                <input id="startTime" name="startTime" type="time" className="rcForm__input" />
            </div>

            <div className={styles.form__timegroup + " fp-col"}>
              <label htmlFor="endTime" className="rcForm__label">
                End
              </label>
              <input id="endTime" name="endTime" type="time" className="rcForm__input" />
            </div>
          </div>

          <div className="inputRow fp-col">
            <label htmlFor="locationName" className="rcForm__label">
              Location name
            </label>
            <input id="locationName" name="locationName" className="rcForm__input" maxLength={256} />
          </div>
          <div className="inputRow fp-col">
            <label htmlFor="locationUrl" className="rcForm__label">
              Google Maps URL
            </label>
            <input
              id="locationUrl"
              name="locationUrl"
              type="url"
              className="rcForm__input"
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div className="textareaRow fp-col">
            <label htmlFor="about" className="rcForm__label">
              About
            </label>
            <textarea id="about" name="about" rows={6} className="rcForm__textarea" maxLength={5000} />
          </div>
        </section>
      </div>

      <div className={styles.form__actions + " fp"}>
        <button
          type="submit"
          className="rcForm__submit btn_main white white--alt"
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? "Creating..." : "Create event"}
        </button>
        {onClose && (
          <button type="button" className={styles.form__cancel + " btn_main accent"} onClick={onClose}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
