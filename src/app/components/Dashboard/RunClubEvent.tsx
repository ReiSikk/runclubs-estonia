"use client";

import React from "react";
import styles from "./RunClubEvent.module.css";
import moment from "moment";
import type { RunClubEvent } from "@/app/lib/types/runClubEvent";
import * as Accordion from "@radix-ui/react-accordion";
import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase/firebase";
import { AlertDialog, DropdownMenu } from "radix-ui";
import  Link  from "next/link";
import { LucideArrowRight, LucideEllipsisVertical, LucidePencil, LucideTrash2 } from "lucide-react";

interface RunClubEventProps {
  event: RunClubEvent;
  onShowMore?: (id: string) => void;
  onDeleted?: (id: string) => void;
  showActions?: boolean;
  slug?: string;
  directLink?: boolean;
}

function AccordionControlledPreview({ about }: { about: string;}) {
  const [open, setOpen] = useState<string | undefined>(undefined);
  const truncated = about.length > 150 ? `${about.slice(0, 200)}…` : about;
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

export default function RunClubEventCard({ event, onDeleted, showActions, slug, directLink }: RunClubEventProps) {
  const { id, title, about, date, startTime, endTime, locationAddress } = event;

  // Handle deleting actions
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = () => {
    setTimeout(() => {
      setShowDeleteDialog(true);
    }, 100);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "events", event.id));

      if (onDeleted) {
        setShowDeleteDialog(false);
        onDeleted(event.id);
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Could not delete event. Please try again.");
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
      {directLink &&
        <Link href={`/runclubs/${slug}/events/${id}`} className={styles.runClubEvent__link} aria-label={`View details for ${title}`}>
        </Link>
      }
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
            {formattedDate} {startTime ? `• ${startTime}` : ""} {endTime ? `- ${endTime}` : ""}
          </span>
        </div>

        {locationAddress && (
          <div className={styles.runClubEvent__metaItem}>
            <span className={styles.runClubEvent__metaLabel}>Where</span>
            <span className={styles.runClubEvent__metaValue}>{locationAddress}</span>
          </div>
        )}
      </div>

      {about && (
        <div className={styles.runClubEvent__about}>
          {/* truncated preview shown only when accordion is closed */}
          <AccordionControlledPreview about={about} />
        </div>
      )}
      {showActions && 
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <div className={styles.runClubEvent__actionTrigger} role="button" aria-label="Club options">
              <LucideEllipsisVertical size={20} />
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="dropdownContent" sideOffset={5} align="end">
              <DropdownMenu.Label className="dropdownLabel h5">Actions</DropdownMenu.Label>
              <DropdownMenu.Separator className="dropdownSeparator" />
              <DropdownMenu.Item className="dropdownItem fp">
                <Link href={`/runclubs/${slug}/events/${id}`} target="_blank" className="fp">
                Visit event page{" "}
                <div className="dropdownItem__right">
                  <LucideArrowRight size={16} />
                </div>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="dropdownItem fp" onSelect={() => console.log("Edit event handler here")}>
                Edit event{" "}
                <div className="dropdownItem__right">
                  <LucidePencil size={16} />
                </div>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="dropdownItem dropdownItemDelete fp"
                disabled={deleting}
                aria-disabled={deleting}
                aria-label={deleting ? "Deleting event" : "Delete event"}
                onSelect={handleDeleteClick}
              >
                {deleting ? "Deleting…" : "Delete"} event{" "}
                <div className="dropdownItem__right">
                  <LucideTrash2 size={16} />
                </div>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      }
      {showDeleteDialog && (

        <AlertDialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialog.Trigger asChild>
          <button
            type="button"
            className="btn_main accent"
            disabled={deleting}
            aria-disabled={deleting}
            aria-label={deleting ? "Deleting event" : "Delete event"}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className={styles.Overlay} />
            <AlertDialog.Content className={styles.Content}>
              <AlertDialog.Title className={styles.Title + " h3"}>
                Are you absolutely sure?
              </AlertDialog.Title>
              <AlertDialog.Description className={styles.Description}>
                This action cannot be undone. This will permanently delete your
                event and remove your data from our servers.
              </AlertDialog.Description>
              <div className={styles.Buttons + " fp"}>
                <AlertDialog.Cancel asChild>
                  <button className={`${styles.Button} btn_main cream`}>Cancel</button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button className={`${styles.Button} btn_main accent`} onClick={handleDelete}>
                    Yes, delete event
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      )}
    </article>
  );
}
