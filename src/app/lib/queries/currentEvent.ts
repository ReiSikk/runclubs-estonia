import { adminDb } from "@/app/lib/firebase/firebaseAdmin";
import { RunClubEvent } from "../types/runClubEvent";

export async function getEventById(eventId: string): Promise<RunClubEvent | null> {
  if (!eventId) return null;

  try {
    const eventDoc = await adminDb.collection("events").doc(eventId).get();
    if (!eventDoc.exists) return null;

    return {
      id: eventDoc.id,
      ...eventDoc.data(),
    } as RunClubEvent;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}