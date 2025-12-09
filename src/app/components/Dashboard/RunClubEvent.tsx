"use client";

import Image from "next/image";
import styles from "./RunClubEvent.module.css";
import moment from "moment";
import type { RunClubEvent } from "@/app/lib/types/runClubEvent";
import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase/firebase";
import { AlertDialog, DropdownMenu } from "radix-ui";
import Link from "next/link";
import {
  LucideArrowRight,
  LucideClock4,
  LucideEllipsisVertical,
  LucideMapPinned,
  LucidePencil,
  LucideTrash2,
} from "lucide-react";
import { RunClub } from "@/app/lib/types/runClub";

interface RunClubEventProps {
  event: RunClubEvent;
  onShowMore?: (id: string) => void;
  onDeleted?: (id: string) => void;
  onUpdate?: (event: RunClubEvent) => void;
  showActions?: boolean;
  slug?: string;
  directLink?: boolean;
  club?: RunClub;
}

export default function RunClubEventCard({
  event,
  onDeleted,
  onUpdate,
  showActions,
  slug,
  directLink,
  club,
}: RunClubEventProps) {
  const { id, title, date, startTime, endTime, locationAddress } = event;

  // Handle deleting actions
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEventUpdate = () => {
    if (onUpdate) {
      onUpdate(event);
    }
  };

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
    ? eventMoment.format("D MMM, YYYY") // e.g., 25 Nov 2025
    : date;

  // compute day difference using moment
  const daysDiff = eventMoment.clone().startOf("day").diff(moment().startOf("day"), "days");
  const isToday = daysDiff === 0;
  const isTomorrow = daysDiff === 1;

  let displayDate = formattedDate;
  if (isToday) displayDate = "Today";
  else if (isTomorrow) displayDate = "Tomorrow";

  return (
    <div className={styles.runClubEvent + " fp-col"} aria-labelledby={`event-${id}-title`}>
      {club && club.city && club.logo && 
      <header className={styles.runClubEvent__header + " fp"}>
        <div className={`${styles.runClubEvent__avatar} fp`}>
          {club?.logo ? (
            <Image src={club.logo} alt={`${club.name}'s logo`} className={styles.avatar} width={80} height={80} />
          ) : (
            <span className="h3">
              {club?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          )}
        </div>
        <div className={styles.info + " fp-col"}>
          <h4 id={`event-${id}-title`} className={styles.runClubEvent__title + " h4"}>
            {club?.name}
          </h4>
          {club?.city && (
            <div className={styles.runClubEvent__tag + " fp"}>
              <span className={styles.runClubEvent__metaValue}>{club?.city}</span>
            </div>
          )}
        </div>
      </header>
        }

      <div className={styles.runClubEvent__metaItem}>
        <LucideClock4 size={16} />
        <span className={styles.runClubEvent__metaValue}>
          {displayDate} {startTime ? `• ${startTime}` : ""} {endTime ? `- ${endTime}` : ""}
        </span>
      </div>
      <h4 className={styles.runClubEvent__title + " h3"}>{title}</h4>
      {locationAddress && (
        <div className={styles.runClubEvent__metaItem + " fp"}>
          <LucideMapPinned size={16} />
          <span className={styles.runClubEvent__metaValue}>{locationAddress}</span>
        </div>
      )}
      {club && club.approvedForPublication && (
        <Link href={`/runclubs/${slug}/events/${id}`} className={styles.runClubEvent__link + " btn_main"} aria-label={`More information about event: ${title}`}>
          More information
        </Link>
      )}

      {showActions && (
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
              {club?.approvedForPublication && (
                <DropdownMenu.Item className="dropdownItem fp">
                  <Link href={`/runclubs/${slug}/events/${id}`} target="_blank" className="fp">
                    Visit event page{" "}
                    <div className="dropdownItem__right">
                      <LucideArrowRight size={16} />
                    </div>
                  </Link>
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Item className="dropdownItem fp" onSelect={handleEventUpdate}>
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
      )}
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
              <AlertDialog.Title className={styles.Title + " h3"}>Are you absolutely sure?</AlertDialog.Title>
              <AlertDialog.Description className={styles.Description}>
                This action cannot be undone. This will permanently delete your event and remove your data from our
                servers.
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
    </div>
  );
}
