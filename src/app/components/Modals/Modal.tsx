"use client";

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.css";
import { LucideX } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
  noClubsModal?: boolean;
};

export default function Modal({ open, onClose, children, ariaLabel = "Modal dialog", noClubsModal }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  if (typeof document === "undefined" || !document.body) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={`${styles.modal} ${noClubsModal ? styles.noClubsModal : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modal__header + " fp"}>
            <div className={styles.title + " rcForm__step h2 fp"}>
              <span className="icon">
              </span>{" "}
              Create an event
            </div>
          <button className={styles.close} aria-label="Close"     onClick={onClose}>
            <LucideX  size={20} />
          </button>
        </div>
        <div className={styles.modal__wrapper}>
        {children}
        </div>
      </div>
    </div>,
    document.body
  );
}