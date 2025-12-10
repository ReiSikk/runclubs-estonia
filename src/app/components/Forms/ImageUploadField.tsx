"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LucideUpload, LucideXCircle } from "lucide-react";

type Props = {
  name: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  initialUrl?: string;
  onError?: (msg: string | null) => void;
  onRemove?: () => void;
  colorScheme?: "light" | "dark";
};

export type ImageUploadFieldHandle = {
  reset: () => void;
};

export default function ImageUploadField({
  name,
  allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"],
  maxSizeMB = 5,
  initialUrl,
  onError,
  onRemove,
  colorScheme = "dark",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(initialUrl || null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    setFilePreview(initialUrl || null);
  }, [initialUrl]);

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
    <div className="fileWrapper fp-col">
    {initialUrl && 
      <div role="button" aria-label="Remove current image" className="txt-label uppercase removeBtn fp" onClick={onRemove}
      >
        Remove current image <LucideXCircle size={16} />
      </div>
    }
    <div className={`inputRow inputRow__file fp-col ${colorScheme === "dark" ? "dark" : ""}`}>
      <span className={`rcForm__label h5`}>{`Drop your file here ${initialUrl ? "to replace the current image" : ""} or...`}</span>
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
      {filePreview &&  (
        <div style={{ marginTop: "0.8rem" }} className="existingImage fp-col">
          <Image
            src={filePreview}
            alt="Image preview"
            loading="lazy"
            width={400}
            height={300}
            style={{ width: "100%", height: "auto", borderRadius: "8px", objectFit: "cover" }}
          />
        </div>
      )}
    </div>
    </div>

  );
}
