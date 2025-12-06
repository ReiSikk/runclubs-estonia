"use server";

import 'server-only'; // Ensure these server actions don't get bundled into client

import { submitRunClubSchema } from "@/app/lib/types/submitRunClub";
import { adminApp, adminDb, adminAuth } from "@/app/lib/firebase/firebaseAdmin";
import { getStorage } from "firebase-admin/storage";
import getOptionalField from "@/app/lib/utils/getOptionalField";
import normalizeToSlug from "@/app/lib/utils/generateSlugFromName";
import sanitizeSVGs from "@/app/lib/utils/sanitizeSvgs";
import { Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { submitEventSchema } from './lib/types/submitEvent';
import { uploadImageToStorage } from './lib/firebase/uploadImageToStorage';

type ActionResult =
  | { success: true; message: string; id?: string }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function saveRunClub(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {

  const mode = formData.get("mode") as "create" | "update";
  const clubId = formData.get("clubId") as string | null;

  // Get ID token from formData
  const idToken = formData.get("idToken") as string | undefined;
  if (!idToken) {
    return {
      success: false,
      message: "You must be logged in to submit a run club.",
    };
  }

    // Verify the token and get the UID
  let creatorUid: string;
  try {
    const decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
    creatorUid = decodedToken.uid;
  } catch {
    return {
      success: false,
      message: "Invalid or expired authentication token.",
    };
  }

  // For update mode, verify ownership
  if (mode === "update") {
    if (!clubId) {
      return {
        success: false,
        message: "Club ID is required for updates.",
      };
    }

    const clubDoc = await adminDb.collection("runclubs").doc(clubId).get();
    if (!clubDoc.exists) {
      return { success: false, message: "Club not found." };
    }
    
    const clubData = clubDoc.data();
    if (clubData?.creator_id !== creatorUid) {
      return { success: false, message: "You don't have permission to update this club." };
    }
  }

  try {
    let logoUrl: string | null = null;
    const logoFile = formData.get("logo") as File | null;

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
      updatedAt: Timestamp.now(),
    };

    // Set these fields only when creating doc
    if (mode === "create") {
      submission.approvedForPublication = false;
      submission.createdAt = Timestamp.now();
      submission.creator_id = creatorUid;
    }

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

    // Save to Firestore - CREATE or UPDATE depending on mode prop in form
    if (mode === "create") {
      await adminDb.collection("runclubs").add(cleanData);
      return {
        success: true,
        message: "Success! Your club has been registered and is pending approval.",
      };
    } else {
      await adminDb.collection("runclubs").doc(clubId!).update(cleanData);
      return {
        success: true,
        message: "Success! Your club has been updated.",
      };
    }
  } catch (error: unknown) {
    console.error("Error saving run club:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

    return {
      success: false,
      message: errorMessage,
      errors: {},
    };
  }
}


/*
   Create event server action
   ========================================================================== */

export async function createEvent(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  // Expect idToken in formData (client should include user.getIdToken())
  const idToken = formData.get("idToken") as string | undefined;
  if (!idToken) {
    return {
      success: false,
      message: "You must be logged in to create an event.",
    };
  }

  // Verify token and get UID
  let creatorUid: string;
  try {
    const decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
    creatorUid = decodedToken.uid;
  } catch {
    return {
      success: false,
      message: "Invalid or expired authentication token.",
    };
  }

  try {
    // Extract fields from formData
    const title = String(formData.get("title") || "").trim();
    const date = String(formData.get("date") || "").trim(); // expect yyyy-mm-dd or ISO
    const startTime = String(formData.get("startTime") || "").trim();
    const endTime = String(formData.get("endTime") || "").trim() || null;
    const locationAddress = getOptionalField(formData, "locationAddress") || null;
    const locationUrl = getOptionalField(formData, "locationUrl") || null;
    const about = getOptionalField(formData, "about") || "";
    const runclub_id = String(formData.get("runclub_id") || "").trim();
    const imageFile = formData.get("image") as File | null;
    let imageUrl: string | null = null;
    const tags = formData.getAll("tags") as string[];
    const distance = formData.get("distance") ? Number(formData.get("distance")) : null;
    const pace = formData.get("pace") ? String(formData.get("pace")) : null;

    if (imageFile) {
      // Use event-images folder, fileName can be eventId or Date.now()
      imageUrl = await uploadImageToStorage(imageFile, "event-images", `${Date.now()}-${imageFile.name}`);
    }

    // Ensure runclub exists and that the requesting user is the creator
    const runclubRef = adminDb.collection("runclubs").doc(runclub_id);
    const runclubSnap = await runclubRef.get();
    if (!runclubSnap.exists) {
      return {
        success: false,
        message: "Runclub not found",
      };
    }
    const runclubData = runclubSnap.data() as Record<string, unknown>;
    if (runclubData.creator_id !== creatorUid) {
      return {
        success: false,
        message: "Forbidden: you are not the owner of this run club",
      };
    }

    // Build submission object for validation
    const submission: Record<string, unknown> = {
      title,
      date,
      startTime,
      endTime,
      locationAddress,
      locationUrl,
      about,
      runclub_id,
      creator_id: creatorUid,
      image: imageUrl,
      tags,
      distance,
      pace,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Validate with Zod schema
    const validatedFields = submitEventSchema.safeParse(submission);

    if (!validatedFields.success) {
      const errors: Record<string, string[]> = {};
      validatedFields.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });

      return {
        success: false,
        message: "Please check the form for errors.",
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

    // Ensure server-controlled fields
    cleanData.creator_id = creatorUid;
    cleanData.runclub_id = runclub_id;
    cleanData.runclub = runclubRef; // admin SDK DocumentReference stored in Firestore

    // Save to Firestore under "events"
    const docRef = await adminDb.collection("events").add(cleanData);

    return {
      success: true,
      message: "Event successfully created!",
      id: docRef.id,
    };
  } catch (error: unknown) {
    console.error("createEvent action error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

/*
   Delete club alongside it's connected events server action
   ========================================================================== */

export async function deleteRunClub(clubId: string, idToken: string) {
  // Verify the user
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch {
    return { success: false, message: 'Unauthorized' };
  }

  const userId = decodedToken.uid;

  try {
    // Verify ownership
    const clubDoc = await adminDb.collection('runclubs').doc(clubId).get();
    
    if (!clubDoc.exists) {
      return { success: false, message: 'Club not found' };
    }

    const clubData = clubDoc.data();
    if (clubData?.creator_id !== userId) {
      return { success: false, message: 'You do not own this club' };
    }

    // Delete events first (cascade)
    const eventsSnapshot = await adminDb
      .collection('events')
      .where('runclub_id', '==', clubId)
      .get();

    const batch = adminDb.batch();

    // Add all events to batch delete
    for (const doc of eventsSnapshot.docs) {
      batch.delete(doc.ref);
    }

    // Add club to batch delete
    batch.delete(adminDb.collection('runclubs').doc(clubId));

    // Execute batch (atomic - all or nothing)
    await batch.commit();

    return { 
      success: true, 
      message: `Club and ${eventsSnapshot.size} event(s) deleted successfully`,
      deletedEventsCount: eventsSnapshot.size
    };
  } catch (error) {
    console.error('Error deleting club:', error);
    return { success: false, message: 'Failed to delete club' };
  }
}