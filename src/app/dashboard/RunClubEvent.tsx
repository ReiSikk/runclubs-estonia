"use client";

import React from "react";
import styles from "./RunClubEvent.module.css";
import moment from "moment";
import type { RunClubEvent } from "@/app/lib/types/runClubEvent";
import * as Accordion from "@radix-ui/react-accordion";
import { useState } from "react";

interface RunClubEventProps {
  event: RunClubEvent;
  onShowMore?: (id: string) => void;
}

function AccordionControlledPreview({
  description,
  id,
}: {
  description: string;
  id: string;
}) {
  const [open, setOpen] = useState<string | undefined>(undefined);
  const truncated = description.length > 200 ? `${description.slice(0, 200)}…` : description;

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
            <p className={styles.runClubEvent__description}>{description}</p>
          </Accordion.Content>
          <Accordion.Trigger className={styles.runClubEvent__showMoreTrigger}>
            {open === "desc" ? "Show less" : "Show more"}
          </Accordion.Trigger>
        </Accordion.Item>
      </Accordion.Root>
    </>
  );
}

export default function RunClubEvent({ event, onShowMore }: RunClubEventProps) {
  const { id, title, description, date, time, location, status } = event;

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

  const statusClass =
    status === "approved"
      ? styles["runClubEvent__status--approved"]
      : status === "in_review"
      ? styles["runClubEvent__status--in-review"]
      : "";


  return (
    <article className={styles.runClubEvent} aria-labelledby={`event-${id}-title`}>
      {status && (
        <div className={`${styles.runClubEvent__status} ${statusClass} txt-body`}>
          {status === "approved" ? "Approved" : status === "in_review" ? "In review" : "Draft"}
        </div>
      )}

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

      {description && (
        <div className={styles.runClubEvent__about}>
          {/* truncated preview shown only when accordion is closed */}
          {/* we'll control the Accordion so we can hide the preview when open */}
          <AccordionControlledPreview description={description} id={id} />
        </div>
      )}
    </article>
  );
}
