"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.css";
import { LucideX } from "lucide-react";
import FormToast from "../Toast/Toast";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
  noClubsModal?: boolean;
  isClubsModal?: boolean;
  toast?: { message: string; type: 'success' | 'error'; countdown?: number | null } | null;
  toastOpen?: boolean;
  onToastOpenChange?: (open: boolean) => void;
};

export default function Modal({ open, onClose, children, ariaLabel = "Modal dialog", noClubsModal, isClubsModal, toast, toastOpen, onToastOpenChange }: ModalProps) {
  // Countdown state for toast
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (toast?.countdown !== undefined) {
      setCountdown(toast.countdown);
    }
  }, [toast?.countdown]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => (c ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

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

  if (typeof document === "undefined" || !document.body) return null;

  return ReactDOM.createPortal(
    <div className={`${styles.overlay} ${open ? styles.visible : ""}`} role="presentation" onClick={onClose}>
        {toast && toastOpen !== undefined && onToastOpenChange && (
        <FormToast
          message={toast.type === 'success' && countdown ? `${toast.message} Closing in (${countdown})...` : toast.message}
          type={toast.type}
          open={toastOpen}
          onOpenChange={onToastOpenChange}
          aria-live="polite"
        />
      )}
      <div
        className={`${styles.modal} ${open ? styles.visible : ""} ${noClubsModal ? styles.noClubsModal : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        {!noClubsModal &&
        <div className={styles.modal__header + " fp"}>
            <div className={styles.title + " rcForm__step h2 fp"}>
              <span className="icon">
              </span>{" "}
              {isClubsModal ? "Edit run club" : "Create an event"}
            </div>
          <button className={styles.close} aria-label="Close"     onClick={onClose}>
            <LucideX  size={20} />
          </button>
        </div>
        }
        <div className={styles.modal__wrapper}>
        {children}
        </div>
      </div>
    </div>,
    document.body
  );
}