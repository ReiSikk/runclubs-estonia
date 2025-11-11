'use server';

import { submitRunClubSchema } from "@/app/lib/types/submitRunClub";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "@/app/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { boolean } from "zod";
import getOptionalField  from "@/app/lib/utils/getOptionalField";
import normalizeToSlug from "@/app/lib/utils/generateSlugFromName";


type ActionResult = 
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function createRunClub(
  prevState: ActionResult | undefined, 
  formData: FormData
): Promise<ActionResult> {
  try {
    // Handle logo file upload
    const logoFile = formData.get("logo") as File | null;
    let logoUrl = "";

    if (logoFile && logoFile.size > 0) {
      // Validate file size
      if (logoFile.size > 5 * 1024 * 1024) {
        return {
          success: false,
          message: "File is too large (max 5MB).",
          errors: { logo: ["File is too large (max 5MB)."] }
        };
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(logoFile.type)) {
        return {
          success: false,
          message: "Accepted formats: JPG, JPEG, PNG, WEBP.",
          errors: { logo: ["Accepted formats: JPG, JPEG, PNG, WEBP."] }
        };
      }

      try {
        // Upload to Firebase Storage
        const buffer = await logoFile.arrayBuffer();
        const fileName = `${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const logoRef = ref(storage, `runclub-logos/${fileName}`);
        
        await uploadBytes(logoRef, Buffer.from(buffer), { 
          contentType: logoFile.type 
        });
        logoUrl = await getDownloadURL(logoRef);
        
        console.log("Logo uploaded successfully:", logoUrl);
      } catch (storageError) {
        console.error("Storage upload error:", storageError);
        return {
          success: false,
          message: "Uploading the logo failed. Please try again.",
          errors: { logo: ["Uploading the logo failed. Please try again."] }
        };
      }
    }

    // Build submission object
    const submission: Record<string, unknown> = {
      name: formData.get("name") as string,
      slug: normalizeToSlug(formData.get("name") as string),
      runDays: formData.getAll("runDays") as string[],
      distance: formData.get("distance") as string,
      startTime: formData.get("startTime") as string,
      city: formData.get("city") as string,
      area: formData.get("area") as string,
      description: formData.get("description") as string,
      email: formData.get("email") as string,
      approvedForPublication: boolean().default(false).parse(false),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add logo URL if uploaded
    if (logoUrl) {
      submission.logo = logoUrl;
    }

    // Add optional fields
    const distanceDescription = getOptionalField(formData, "distanceDescription");
    if (distanceDescription) {
      submission.distanceDescription = distanceDescription;
    }

    const address = getOptionalField(formData, "address");
    if (address) {
      submission.address = address;
    }

    const instagram = getOptionalField(formData, "instagram");
    if (instagram) {
      submission.instagram = instagram;
    }

    const facebook = getOptionalField(formData, "facebook");
    if (facebook) {
      submission.facebook = facebook;
    }

    const strava = getOptionalField(formData, "strava");
    if (strava) {
      submission.strava = strava;
    }

    const website = getOptionalField(formData, "website");
    if (website) {
      submission.website = website;
    }

    // Validate with Zod schema
    const validatedFields = submitRunClubSchema.safeParse(submission);

    // Return validation errors if any
    if (!validatedFields.success) {
      const errors: Record<string, string[]> = {};
      validatedFields.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      });

      return {
        success: false,
        message: 'Please fix the validation errors',
        errors,
      };
    }

    // Clean data - remove undefined/null/empty values
    const cleanData: Record<string, unknown> = {};
    Object.entries(validatedFields.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanData[key] = value;
      }
    });

    // Save to Firestore
    await addDoc(collection(db, "runclubs"), cleanData);

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