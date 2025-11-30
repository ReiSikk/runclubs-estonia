"use client";

import React from "react";
import styles from "./RunClubEvent.module.css";
import moment from "moment";
import type { RunClubEvent } from "@/app/lib/types/runClubEvent";
import * as Accordion from "@radix-ui/react-accordion";
import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

interface RunClubEventProps {
  event: RunClubEvent;
  onShowMore?: (id: string) => void;
  onDeleted?: (id: string) => void;
}

function AccordionControlledPreview({ about }: { about: string;}) {
  const [open, setOpen] = useState<string | undefined>(undefined);
  const truncated = about.length > 200 ? `${about.slice(0, 200)}…` : about;
  return (
    <>
      {open !== "desc" && (
        <p className={styles.runClubEvent__preview} aria-hidden>
          {truncated}
        </p>
      )}

      <Accordion.Root type="single" collapsible value={open} onValueChange={(v) => setOpen(v)}>
        <Accordion.Item value="desc">
          <Accordion.Content className={styles.runClubEvent__accordionContent}>
            <p className={styles.runClubEvent__description}>{about}</p>
          </Accordion.Content>
          <Accordion.Trigger className={styles.runClubEvent__showMoreTrigger}>
            {open === "desc" ? "Show less" : "Show more"}
          </Accordion.Trigger>
        </Accordion.Item>
      </Accordion.Root>
    </>
  );
}

export default function RunClubEventCard({ event, onDeleted }: RunClubEventProps) {
  const { id, title, about, date, time, location } = event;

    const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "events", event.id));

      if (onDeleted) {
        onDeleted(event.id);
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Could not delete event. Check console for details.");
    } finally {
      setDeleting(false);
    }
  };

  const eventMoment = moment(date);
  const formattedDate = eventMoment.isValid()
    ? eventMoment.format("D MMM") // e.g., 25 Nov
    : date;

  // compute day difference using moment
  const daysDiff = eventMoment.clone().startOf("day").diff(moment().startOf("day"), "days");
  const isToday = daysDiff === 0;
  const isTomorrow = daysDiff === 1;

  let displayDate = formattedDate;
  if (isToday) displayDate = "Today";
  else if (isTomorrow) displayDate = "Tomorrow";
  else if (daysDiff < 0) displayDate = `${Math.abs(daysDiff)} days ago`;


  return (
    <article className={styles.runClubEvent} aria-labelledby={`event-${id}-title`}>
      <header className={styles.runClubEvent__header}>
        <div className={styles.runClubEvent__tags}>
          <span className={styles.runClubEvent__tag}>{displayDate}</span>
        </div>
      </header>

      <h3 id={`event-${id}-title`} className={styles.runClubEvent__title}>
        {title}
      </h3>

      <div className={`${styles.runClubEvent__meta} fp`}>
        <div className={styles.runClubEvent__metaItem}>
          <span className={styles.runClubEvent__metaLabel}>When</span>
          <span className={styles.runClubEvent__metaValue}>
            {formattedDate} {time ? `• ${time}` : ""}
          </span>
        </div>

        {location && (
          <div className={styles.runClubEvent__metaItem}>
            <span className={styles.runClubEvent__metaLabel}>Where</span>
            <span className={styles.runClubEvent__metaValue}>{location}</span>
          </div>
        )}
      </div>

      {about && (
        <div className={styles.runClubEvent__about}>
          {/* truncated preview shown only when accordion is closed */}
          <AccordionControlledPreview about={about} />
        </div>
      )}
       <div className={styles.runClubEvent__actions + " fp"}>
          <button
            type="button"
            className="btn_main accent"
            onClick={handleDelete}
            disabled={deleting}
            aria-disabled={deleting}
            aria-label={deleting ? "Deleting event" : "Delete event"}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
    </article>
  );
}
