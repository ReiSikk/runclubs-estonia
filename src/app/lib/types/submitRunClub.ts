import { z } from "zod";

export const runClubSchema = z.object({
  name: z.string().min(1, { message: "Klubi nimi on kohustuslik." }),
  logo: z.any().optional(),
  runDays: z.string().min(1, { message: "Tavapärased päevad on kohustuslikud." }),
  distance: z.string().min(1, { message: "Distants on kohustuslik." }),
  distanceDescription: z.string().optional(),
  startTime: z.string().min(1, { message: "Algusaeg on kohustuslik." }),
  city: z.string().min(1, { message: "Linn on kohustuslik." }),
  area: z.string().min(1, { message: "Kogunemiskoht on kohustuslik." }),
  address: z.string().optional(),
  description: z.string().min(1, { message: "Sissejuhatus on kohustuslik." }),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  strava: z.string().optional(),
  website: z.string().optional(),
  email: z.string().min(1, { message: "E-post on kohustuslik." }),
  status: z.enum(["pending", "approved", "rejected"]),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export type RunClubSubmission = z.infer<typeof runClubSchema>;