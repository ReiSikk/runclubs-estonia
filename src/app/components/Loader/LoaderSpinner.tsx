import React from "react";
import styles from "./LoaderSpinner.module.css";

type Props = {
  size?: number;
  className?: string;
  label?: string;
};

export default function LoaderSpinner({ size = 12, className = "", label = "Loading" }: Props) {
  const sizeClass =
    size <= 10 ? styles.small : size <= 18 ? styles.medium : styles.large;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`${styles.ellipsisWrap} ${sizeClass} ${className}`}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}