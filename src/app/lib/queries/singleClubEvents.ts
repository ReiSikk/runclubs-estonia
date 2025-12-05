import { db } from "@/app/lib/firebase/firebase";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { RunClubEvent } from "@/app/lib/types/runClubEvent";
import { convertTimestamp } from "../utils/fireStoreConverter";

export async function getSingleClubEvents(clubId: string): Promise<RunClubEvent[]> {
  if (!clubId) return [];

  const today = new Date().toISOString().split("T")[0];

  try {
    const eventsRef = collection(db, "events");
    const q = query(
      eventsRef,
      where("runclub_id", "==", clubId),
      where("date", ">=", today),
      orderBy("date", "asc"),
      limit(10)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    }) as RunClubEvent[];
  } catch (error) {
    console.error("Error fetching single club events:", error);
    return [];
  }
}