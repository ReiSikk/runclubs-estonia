import { forwardRef } from "react";
import styles from "./RunClubRegistrationForm.module.css";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  function CustomInput({ label, error, ...props }, ref) {
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
          />
        </label>
        {error && <span style={{ color: "#c00", fontSize: "0.9rem" }}>{error}</span>}
      </div>
    );
  }
);

interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const CustomTextarea = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  function CustomTextarea({ label, error, ...props }, ref) {
    return (
      <div className={styles.customTextArea}>
        <label className="fp-col txt-body">
          {label}
          <textarea
            ref={ref}
            style={{
              border: error ? "1px solid #c00" : "1px solid #ccc",
            }}
            className={`h5`}
            {...props}
          />
        </label>
        {error && <span style={{ color: "#c00", fontSize: "0.9rem" }}>{error}</span>}
      </div>
    );
  }
);