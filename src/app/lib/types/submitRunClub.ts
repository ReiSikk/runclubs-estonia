import { z } from "zod";

export const runClubSchema = z.object({
  name: z.string().min(1, { message: "Name of the run club is required." }),
  logo: z.any().optional(),
  runDays: z.string().min(1, { message: "Regular running days are required." }),
  distance: z.string().min(1, { message: "Distance is required." }),
  distanceDescription: z.string().optional(),
  startTime: z.string().min(1, { message: "Start time is required." }),
  city: z.string().min(1, { message: "City is required." }),
  area: z.string().min(1, { message: "Area is required." }),
  address: z.string().optional(),
  description: z.string().min(1, { message: "Description is required." }),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  strava: z.string().optional(),
  website: z.string().optional(),
  email: z.string().min(1, { message: "Email is required." }),
  status: z.enum(["pending", "approved", "rejected"]),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export type RunClubSubmission = z.infer<typeof runClubSchema>;