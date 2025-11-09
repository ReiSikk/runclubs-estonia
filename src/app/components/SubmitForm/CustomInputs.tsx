import { forwardRef } from "react";
import styles from "./RunClubRegistrationForm.module.css";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  function CustomInput({ label, error, required, ...props }, ref) {
    return (
      <div className={styles.customInput}>
        <label className="fp-col txt-body">
          {label}
          <input
            ref={ref}
            style={{
              border: error ? "1px solid #c00" : "",
            }}
            className={`h5`}
            {...props}
            required={required}
            aria-required={required}
          />
        </label>
         {error && (
          <p className={styles.customInput__error} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const CustomTextarea = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  function CustomTextarea({ label, error, required, ...props }, ref) {
    return (
      <div className={styles.customTextArea}>
        <label className="fp-col txt-body">
          {label}
          <textarea
            ref={ref}
            required={required}
            aria-required={required}
            style={{
              border: error ? "1px solid #c00" : "1px solid #ccc",
            }}
            className={`h5`}
            {...props}
          />
        </label>
         {error && (
          <p className={styles.customInput__error}>
            {error}
          </p>
        )}
        {!error && required && (
          <p className={`${styles.customInput__required}`}>
            This field is required
          </p>
        )}
      </div>
    );
  }
);