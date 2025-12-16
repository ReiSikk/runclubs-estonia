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
  locationString: z.string().min(1),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description is too long")
    .refine((val) => {
      const text = val.replace(/<[^>]*>/g, '').trim();
      return text.length > 0;
    }, "Description cannot be empty"),
  runclub_id: z.string().min(1),
  image: z.any().optional(),
  tags: z.array(z.string()).optional(),
  distance: z.number().nullable().optional(),
  pace: z.string().nullable().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
});    