import { forwardRef } from "react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  function CustomInput({ label, error, ...props }, ref) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label>
          {label}
          <input
            ref={ref}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: error ? "1px solid #c00" : "1px solid #ccc",
              borderRadius: "0.3rem",
            }}
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
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label>
          {label}
          <textarea
            ref={ref}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: error ? "1px solid #c00" : "1px solid #ccc",
              borderRadius: "0.3rem",
              fontFamily: "inherit",
            }}
            {...props}
          />
        </label>
        {error && <span style={{ color: "#c00", fontSize: "0.9rem" }}>{error}</span>}
      </div>
    );
  }
);