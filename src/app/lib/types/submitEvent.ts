import { z } from "zod";

export const submitEventSchema = z.object({
  title: z.string().min(3).max(200),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date" }), // ISO date string
  startTime: z.string().min(1), // "HH:mm"
  endTime: z.string().optional(),
  locationName: z.string().min(1).max(256),
  locationUrl: z.string().optional(),
  about: z.string().min(1).max(5000), // HTML or markdown string from rich-editor
  runclub_id: z.string().min(1),
});    