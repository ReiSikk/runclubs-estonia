
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";
import { RunClub } from "../types/runClub";
import { runClubConverter } from "../utils/fireStoreConverter";

export async function getCurrentRunClub(slug: string): Promise<RunClub | null> {
    try {
    const clubsRef = collection(db, "runclubs").withConverter(runClubConverter);
    const q = query(
      clubsRef,
      where("slug", "==", slug),
      where("approvedForPublication", "==", true),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const club = querySnapshot.docs[0].data();
    return club;

  } catch (error) {
    console.error(`[Server] Error fetching club with slug ${slug}:`, error);
    return null;
  }
}