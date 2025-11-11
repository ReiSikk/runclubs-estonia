import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
} from 'firebase/firestore';
import { db } from "../firebase";
import { RunClub } from "../types/runClub";
import { runClubConverter } from "../utils/fireStoreConverter";

export async function getRunClubs(): Promise<RunClub[]> {
  try {
    const approvedClubsQuery = query(
      collection(db, "runclubs").withConverter(runClubConverter),
      where("approvedForPublication", "==", true),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(approvedClubsQuery);
    const clubs = querySnapshot.docs.map((doc) => doc.data());

    return clubs;
  } catch (error) {
    console.error("Error fetching run clubs:", error);
    return [];
  }
}