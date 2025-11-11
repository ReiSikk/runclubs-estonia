import { z } from "zod";

export const submitRunClubSchema = z.object({
  name: z.string().min(1, "Name of the run club is required.").max(256, "Name must be less than 256 characters."),

  logo: z.any().optional(),

  runDays: z
    .array(z.string())
    .min(1, "Please select at least one day.")
    .refine(
      (days) =>
        days.every((day) =>
          ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(day)
        ),
      "Invalid day selected."
    ),

  distance: z.string().min(1, "Distance is required.").max(256, "Distance must be less than 256 characters."),

  distanceDescription: z.string().max(1000, "Description must be less than 1000 characters.").optional(),

  startTime: z.string().min(1, "Start time is required.").max(256, "Start time must be less than 256 characters."),

  city: z.string().min(1, "City is required.").max(256, "City must be less than 256 characters."),

  area: z.string().min(1, "Area is required.").max(256, "Area must be less than 256 characters."),

  address: z.string().max(256, "Address must be less than 256 characters.").optional(),

  description: z
    .string()
    .min(1, "Description is required.")
    .min(10, "Description must be at least 10 characters.")
    .max(5000, "Description must be less than 5000 characters."),

  instagram: z.string().max(2048, "URL must be less than 2048 characters.").optional(),

  facebook: z.string().url("Please enter a valid URL.").max(2048, "URL must be less than 2048 characters.").optional(),

  strava: z.string().max(2048, "URL must be less than 2048 characters.").optional(),

  website: z.string().max(2048, "URL must be less than 2048 characters.").optional(),

  email: z.string().min(1, "Email is required.").max(254, "Email must be less than 254 characters."),

  approvedForPublication: z.boolean().default(false),
  createdAt: z.any(),
  updatedAt: z.any(),
});
