import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from "../firebase";
import { RunClub } from "../types/runClub";

// Create a typed converter
const runClubConverter: FirestoreDataConverter<RunClub> = {
  toFirestore: (club: RunClub) => {
    const { id, ...data } = club;
    return data;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): RunClub => {
    const data = snapshot.data() as Omit<RunClub, 'id' | 'createdAt' | 'updatedAt'> & {
        createdAt: Timestamp | string;
        updatedAt?: Timestamp | string;
      };
    
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : typeof data.createdAt === 'string'
          ? data.createdAt
          : new Date().toISOString(),
      updatedAt: data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : typeof data.updatedAt === 'string'
          ? data.updatedAt
          : new Date().toISOString(),
    } as RunClub;
  }
};


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