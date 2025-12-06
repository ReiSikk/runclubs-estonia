import { z } from "zod";

export const submitEventSchema = z.object({
  title: z.string().min(3).max(256),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => {
      const today = new Date().toISOString().split("T")[0];
      return val >= today;
    }, "Date must be today or in the future"),
  startTime: z.string().min(1), // "HH:mm"
  endTime: z.string().nullable().optional(),
  locationAddress: z.string().min(1).max(256),
  locationUrl: z.string().nullable().optional(),
  about: z.string().min(1).max(5000), // HTML or markdown string from rich-editor
  runclub_id: z.string().min(1),
});    