"use server";

import 'server-only'; // Ensure these server actions don't get bundled into client

import { submitRunClubSchema } from "@/app/lib/types/submitRunClub";
import { adminApp, adminDb } from "@/app/lib/firebaseAdmin";
import { getStorage } from "firebase-admin/storage";
import { boolean } from "zod";
import getOptionalField from "@/app/lib/utils/getOptionalField";
import normalizeToSlug from "@/app/lib/utils/generateSlugFromName";
import sanitizeSVGs from "@/app/lib/utils/sanitizeSvgs";
import { Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

type ActionResult =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function createRunClub(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {

  // Get ID token from formData
  const idToken = formData.get("idToken") as string | undefined;
  if (!idToken) {
    return {
      success: false,
      message: "You must be logged in to submit a run club.",
    };
  }

    // 2. Verify the token and get the UID
  let creatorUid: string;
  try {
    const decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
    creatorUid = decodedToken.uid;
  } catch (err) {
    return {
      success: false,
      message: "Invalid or expired authentication token.",
    };
  }

  try {
    const logoFile = formData.get("logo") as File | null;
    let logoUrl = "";

    // File upload with Admin SDK
    if (logoFile && logoFile.size > 0) {
      // Validate file size
      if (logoFile.size > 5 * 1024 * 1024) {
        return {
          success: false,
          message: "File is too large (max 5MB).",
          errors: { logo: ["File is too large (max 5MB)."] },
        };
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
      if (!allowedTypes.includes(logoFile.type)) {
        return {
          success: false,
          message: "Accepted formats: JPG, JPEG, PNG, WEBP, SVG.",
          errors: { logo: ["Accepted formats: JPG, JPEG, PNG, WEBP, SVG."] },
        };
      }

      // File upload with Admin SDK
      const bucket = getStorage(adminApp).bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
      const fileName = `${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const file = bucket.file(`runclub-logos/${fileName}`);

      if (logoFile.type === "image/svg+xml") {
        try {
          const svgContent = await logoFile.text();
          const sanitizedSvg = sanitizeSVGs(svgContent);

          if (!sanitizedSvg) {
            return {
              success: false,
              message: "Invalid or unsafe SVG file.",
              errors: { logo: ["SVG sanitization failed."] },
            };
          }

          // Upload sanitized SVG with Admin SDK
          await file.save(sanitizedSvg, {
            contentType: "image/svg+xml",
            metadata: {
              contentType: "image/svg+xml",
            },
          });
        } catch (svgError) {
          console.error("SVG processing error:", svgError);
          return {
            success: false,
            message: "Failed to process SVG file.",
            errors: { logo: ["Invalid SVG file."] },
          };
        }
      } else {
        try {
          // Upload regular image with Admin SDK
          const arrayBuffer = await logoFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          await file.save(buffer, {
            contentType: logoFile.type,
            metadata: {
              contentType: logoFile.type,
            },
          });
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          return {
            success: false,
            message: "Failed to upload logo.",
            errors: { logo: ["Upload failed."] },
          };
        }
      }

      // Make file publicly accessible and get URL
      await file.makePublic();
      logoUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    }

    // Build submission object
    const submission: Record<string, unknown> = {
      name: formData.get("name") as string,
      slug: normalizeToSlug(formData.get("name") as string),
      runDays: formData.getAll("runDays") as string[],
      distance: formData.get("distance") as string,
      city: formData.get("city") as string,
      area: formData.get("area") as string,
      description: formData.get("description") as string,
      email: formData.get("email") as string,
      approvedForPublication: boolean().default(false).parse(false),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      creator_id: creatorUid,
    };

    if (logoUrl) {
      submission.logo = logoUrl;
    }

    // Add optional fields
    const startTime = getOptionalField(formData, "startTime");
    if (startTime) submission.startTime = startTime;

    const distanceDescription = getOptionalField(formData, "distanceDescription");
    if (distanceDescription) submission.distanceDescription = distanceDescription;

    const address = getOptionalField(formData, "address");
    if (address) submission.address = address;

    const instagram = getOptionalField(formData, "instagram");
    if (instagram) submission.instagram = instagram;

    const facebook = getOptionalField(formData, "facebook");
    if (facebook) submission.facebook = facebook;

    const strava = getOptionalField(formData, "strava");
    if (strava) submission.strava = strava;

    const website = getOptionalField(formData, "website");
    if (website) submission.website = website;

    // Validate with Zod
    const validatedFields = submitRunClubSchema.safeParse(submission);

    if (!validatedFields.success) {
      const errors: Record<string, string[]> = {};
      validatedFields.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });

      return {
        success: false,
        message: "Please fix the validation errors",
        errors,
      };
    }

    // Clean data
    const cleanData: Record<string, unknown> = {};
    Object.entries(validatedFields.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanData[key] = value;
      }
    });

    // Save to Firestore using Admin SDK
    await adminDb.collection("runclubs").add(cleanData);

    return {
      success: true,
      message: "Success! Your club has been registered and is pending approval.",
    };
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

    return {
      success: false,
      message: errorMessage,
      errors: {},
    };
  }
}