import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { submitEventSchema } from "@/app/lib/types/submitEvent";
import { adminAuth, adminDb } from "@/app/lib/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const authHeader = req.headers.get("authorization");
    const idToken =
      authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : body.idToken;
    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized: missing id token" }, { status: 401 });
    }

    // verify token
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // validate payload (expects runclub_id to be present)
    const parsed = submitEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error }, { status: 400 });
    }
    const data = parsed.data;

    // ensure runclub exists and the requesting user is its creator
    const runclubId = data.runclub_id;
    const runclubRef = adminDb.collection("runclubs").doc(runclubId);
    const runclubSnap = await runclubRef.get();
    if (!runclubSnap.exists) {
      return NextResponse.json({ error: "Runclub not found" }, { status: 404 });
    }
    const runclubData = runclubSnap.data() as Record<string, unknown>;

    if (runclubData.creator_id !== uid) {
      return NextResponse.json({ error: "Forbidden: not the runclub owner" }, { status: 403 });
    }

    // create event document (server-set creator + timestamps)
    const eventsCol = adminDb.collection("events");
    const newRef = eventsCol.doc();
    const eventDoc = {
      title: data.title,
      description: data.about ?? "",
      date: data.date,
      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,
      locationAddress: data.locationAddress ?? null,
      locationUrl: data.locationUrl ?? null,
      runclub_id: data.runclub_id,
      creator_id: uid,
    };
    await newRef.set(eventDoc);

    return NextResponse.json({ success: true, id: newRef.id }, { status: 201 });
  } catch (err: unknown) {
    console.error("create-event error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}