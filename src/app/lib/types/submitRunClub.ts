import { z } from "zod";

// const ACCEPTED_TYPES = [
//   "image/jpeg",
//   "image/jpg",
//   "image/png",
//   "image/webp"
// ];

export const runClubSchema = z.object({
  name: z.string().min(1, { message: "Klubi nimi on kohustuslik." }),
  logo: z.any().optional(),
//   logo: z
//     .any()
//     .refine(
//       (file) =>
//         !file || (file instanceof File && file.size <= 5 * 1024 * 1024),
//       { message: "Logo faili maksimaalne suurus on 5MB." }
//     )
//     .refine(
//       (file) =>
//         !file ||
//         (file instanceof File && ACCEPTED_TYPES.includes(file.type)),
//       { message: "Ainult JPG, JPEG, PNG või WEBP formaadid on lubatud." }
//     ),
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
});
