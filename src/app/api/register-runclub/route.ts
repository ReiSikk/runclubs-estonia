import { NextRequest, NextResponse } from "next/server";
// Types
import { submitRunClubSchema } from "@/app/lib/types/submitRunClub";
// Firbase
import { db, storage } from "@/app/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function getOptionalField(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (!value || value === null) return undefined;
  const strValue = value.toString().trim();
  return strValue.length > 0 ? strValue : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const logoFile = formData.get("logo") as File | null;
    let logoUrl = "";

    if (logoFile && logoFile.size > 0) {
      if (logoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File is too large (max 5MB)." },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(logoFile.type)) {
        return NextResponse.json(
          { error: "Accepted formats: JPG, JPEG, PNG, WEBP." },
          { status: 400 }
        );
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
        return NextResponse.json(
          { error: "Uploading the logo failed. Please try again." },
          { status: 500 }
        );
      }
    }

    // Build submission object
    const submission: Record<string, unknown> = {
      name: formData.get("name") as string,
      runDays: formData.get("runDays") as string,
      distance: formData.get("distance") as string,
      startTime: formData.get("startTime") as string,
      city: formData.get("city") as string,
      area: formData.get("area") as string,
      description: formData.get("description") as string,
      email: formData.get("email") as string,
      status: "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add optional fields only if they have values
    if (logoUrl) {
      submission.logo = logoUrl;
    }

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

    console.log("Submission object (before validation):", submission);

    // Validate with Zod
    const validated = submitRunClubSchema.safeParse(submission);
    if (!validated.success) {
      // Format Zod errors to match frontend expectations
      const formatted = validated.error.format();
      const fieldErrors: Record<string, string[]> = {};
      
      Object.keys(formatted).forEach((key) => {
        if (key !== "_errors") {
          const field = formatted[key as keyof typeof formatted];
          if (field && typeof field === "object" && "_errors" in field) {
            fieldErrors[key] = field._errors as string[];
          }
        }
      });

      console.log("Validation errors:", fieldErrors);

      return NextResponse.json(
        { 
          error: "Validation failed.",
          errors: fieldErrors
        },
        { status: 400 }
      );
    }

    console.log("Validated data:", validated.data);

    // Save to Firestore DB
    const docRef = await addDoc(collection(db, "runclubs"), validated.data);

    return NextResponse.json({ 
      success: true, 
      message: "Club registration successful!",
      id: docRef.id
    }, { status: 200 });

  } catch (error: unknown) { 
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Server error occurred.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}