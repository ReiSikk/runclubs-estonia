"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { LucideUpload } from "lucide-react";

type Props = {
  name: string;
  altStyle?: boolean;
  allowedTypes?: string[];
  maxSizeMB?: number;
  initialUrl?: string;
  onError?: (msg: string | null) => void;
};

export default function ImageUploadField({
  name,
  altStyle = false,
  allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"],
  maxSizeMB = 5,
  initialUrl,
  onError,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(initialUrl || null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileError(null);
      setFilePreview(initialUrl || null);
      onError?.(null);
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      const msg = `File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${maxSizeMB}MB.`;
      setFileError(msg);
      setFilePreview(null);
      event.target.value = "";
      onError?.(msg);
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      const msg = "Accepted formats: JPG, JPEG, PNG, WEBP, SVG.";
      setFileError(msg);
      setFilePreview(null);
      event.target.value = "";
      onError?.(msg);
      return;
    }
    setFileError(null);
    onError?.(null);
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className={`inputRow inputRow__file fp-col ${altStyle ? "alt" : ""}`}>
      <span className={`rcForm__label h5`}>Drop your file here or...</span>
      <div className={`rcForm__uploadBtn btn_main`}>
        Select file
        <div className={`icon fp`}>
          <LucideUpload size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
        </div>
      </div>
      <input
        id={name}
        name={name}
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(",")}
        className="rcForm__file"
        onChange={handleFileChange}
      />
      {fileError && (
        <p className="rcForm__hint" role="alert">
          {fileError}
        </p>
      )}
      {filePreview && (
        <div style={{ marginTop: "0.8rem" }}>
          <Image
            src={filePreview}
            alt="Image preview"
            style={{ maxWidth: "250px", maxHeight: "250px", borderRadius: "0.8rem", objectFit: "cover" }}
            loading="lazy"
            width={250}
            height={250}
          />
        </div>
      )}
    </div>
  );
}
