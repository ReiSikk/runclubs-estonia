"use client";

import Link from 'next/link'
// Styles and assets
import styles from "./RunClubCard.module.css";
import { LucideEllipsisVertical, LucidePencil, LucideTrash2, LucideArrowRight } from "lucide-react";
// Hooks & Utils
import { useState } from "react";
import { RunClub } from "@/app/lib/types/runClub";
import { convertDaysToAbbs } from "@/app/lib/utils/convertDays";
// Radix UI
import { DropdownMenu, AlertDialog } from "radix-ui";
// Firebase
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
// Types
import type { RunClub } from "@/app/lib/types/runClub";

interface RunClubCardProps {
  club: RunClub;
  onDeleted?: (id: string) => void;
  onEdit?: (club: RunClub) => void;
}

const RunClubCard = ({ club, onDeleted, onEdit }: RunClubCardProps) => {
  const { name, distance, city, area, runDays, approvedForPublication } = club;
  // Convert run days to abbreviated format
  const daysList = convertDaysToAbbs(runDays);
  // Determine status label class
  const statusClass = approvedForPublication ? styles.approved : styles.pending;

  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle club UPDATE
  const handleEdit = () => {
    setDropdownOpen(false);
    setTimeout(() => {
      onEdit?.(club);
    }, 100);
  };

  const handleDeleteClick = () => {
    setDropdownOpen(false);
    setTimeout(() => {
      setShowDeleteDialog(true);
    }, 100);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "runclubs", club.id));

      if (onDeleted) {
        onDeleted(club.id);
      }
      setShowDeleteDialog(false);
    } catch (err) {
      console.error("Failed to delete club:", err);
      alert(
        "Could not delete club. Please try again or contact us if you think you should have the permissions to do so."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`${styles.clubCard}`}>
      <div className={`${styles.clubCard__header} fp`}>
        <div className={`${styles.clubCard__status} ${statusClass} fp`}>
          {approvedForPublication ? "Approved" : "Pending"}
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <div className={styles.icon} role="button" aria-label="Club options">
              <LucideEllipsisVertical size={20} />
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={styles.dropdownContent} sideOffset={5} align="end">
              <DropdownMenu.Label className={styles.dropdownLabel + " h5"}>Actions</DropdownMenu.Label>
              <DropdownMenu.Separator className={styles.dropdownSeparator} />
              <DropdownMenu.Item className={styles.dropdownItem + " fp"}>
                <Link href={`/runclubs/${club.slug}`} target="_blank" className="fp">
                Visit club page{" "}
                <div className={styles.dropdownItem__right}>
                  <LucideArrowRight size={16} />
                </div>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item className={styles.dropdownItem + " fp"} onSelect={handleEdit}>
                Edit Club{" "}
                <div className={styles.dropdownItem__right}>
                  <LucidePencil size={16} />
                </div>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={`${styles.dropdownItem} ${styles.dropdownItemDelete} fp`}
                disabled={deleting}
                aria-disabled={deleting}
                aria-label={deleting ? "Deleting club" : "Delete club"}
                onSelect={handleDeleteClick}
              >
                {deleting ? "Deleting…" : "Delete"} Club{" "}
                <div className={styles.dropdownItem__right}>
                  <LucideTrash2 size={16} />
                </div>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Confirmation dialog for delete club action */}
        <AlertDialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className={styles.Overlay} />
            <AlertDialog.Content className={styles.Content}>
              <AlertDialog.Title className={styles.Title + " h3"}>Are you absolutely sure?</AlertDialog.Title>
              <AlertDialog.Description className={styles.Description}>
                This action cannot be undone. This will permanently delete your club and remove your data from our
                servers.
              </AlertDialog.Description>
              <div className={styles.Buttons + " fp"}>
                <AlertDialog.Cancel asChild>
                  <button className={`${styles.Button} btn_main cream`} disabled={deleting}>
                    Cancel
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button className={`${styles.Button} btn_main accent`} onClick={handleDelete} disabled={deleting}>
                    {deleting ? "Deleting…" : "Yes, delete club"}
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
      <div className={styles.clubCard__content}>
        <h3 className={`${styles.clubCard__title} h4`}>{name}</h3>
        <p className={`${styles.clubCard__description} txt-small`}>
          {city}, {area} • {distance} km
        </p>
        <div className={` ${styles.clubCard__days} fp`}>
          {daysList.map((day) => (
            <li key={day} className={`${styles.day} fp card-label--small`}>
              {day}
            </li>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RunClubCard;
