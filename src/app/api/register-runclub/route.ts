import { NextRequest, NextResponse } from "next/server";
import { runClubSchema } from "@/app/lib/types/submitRunClub";
import { db } from "@/app/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { treeifyError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Build submission object (logo upload disabled for now)
    const submission = {
      name: formData.get("name") as string,
      // logo: undefined, // Will add back when Storage is configured
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