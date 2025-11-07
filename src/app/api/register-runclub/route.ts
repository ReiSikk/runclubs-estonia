import { NextRequest, NextResponse } from "next/server";
// Types
import { runClubSchema } from "@/app/lib/types/submitRunClub";
// Firbase
import { db, storage } from "@/app/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// Zod validation
import { treeifyError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

     // Extract and validate logo file
    const logoFile = formData.get("logo") as File | null;
    let logoUrl = "";

    if (logoFile && logoFile.size > 0) {
      // Validate file size (5MB)
      if (logoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Logo fail on liiga suur (max 5MB)." },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(logoFile.type)) {
        return NextResponse.json(
          { error: "Lubatud formaadid: JPG, PNG, WEBP." },
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
          { error: "Logo üleslaadimine ebaõnnestus. Palun proovi uuesti." },
          { status: 500 }
        );
      }
    }

    // Build submission object
    const submission = {
      name: formData.get("name") as string,
      logo: logoUrl || undefined, 
      runDays: formData.get("runDays") as string,
      distance: formData.get("distance") as string,
      distanceDescription: (formData.get("distanceDescription") as string) || undefined,
      startTime: formData.get("startTime") as string,
      city: formData.get("city") as string,
      area: formData.get("area") as string,
      address: (formData.get("address") as string) || undefined,
      description: formData.get("description") as string,
      instagram: (formData.get("instagram") as string) || undefined,
      facebook: (formData.get("facebook") as string) || undefined,
      strava: (formData.get("strava") as string) || undefined,
      website: (formData.get("website") as string) || undefined,
      email: formData.get("email") as string,
      status: "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Validate with Zod
    const validated = runClubSchema.safeParse(submission);
    if (!validated.success) {
      return NextResponse.json(
        { 
          error: "Valideerimise viga",
          errors: treeifyError(validated.error)
        },
        { status: 400 }
      );
    }

    // Save to Firestore DB
    const docRef = await addDoc(collection(db, "runclubs"), validated.data);

    return NextResponse.json({ 
      success: true, 
      message: "Klubi registreerimine õnnestus!",
      id: docRef.id
    }, { status: 200 });

  } catch (error: unknown) { 
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Serveri viga";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}