import { 
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { RunClub } from '../types/runClub';

/**
 * Generic Firestore converter that handles Timestamp serialization
 * @returns FirestoreDataConverter for RunClub type
 */
export const runClubConverter: FirestoreDataConverter<RunClub> = {
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
      ...data,
      id: snapshot.id,
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
    };
  }
};

/**
 * Helper function to convert Firestore Timestamp to ISO string
 * @param timestamp - Firestore Timestamp or string
 * @returns ISO string representation of the date
 */
export function convertTimestamp(timestamp: Timestamp | string | undefined): string {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return new Date().toISOString();
}