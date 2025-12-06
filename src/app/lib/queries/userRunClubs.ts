import { RunClub } from '@/app/lib/types/runClub';
import { convertTimestamp } from '../utils/fireStoreConverter';

// Unified query function for server and client
export async function getUserRunClubs(userId?: string): Promise<RunClub[]> {
   if (!userId) return [];

  if (typeof window === 'undefined') {
    // Admin SDK (server-side)
    try {
      const { adminDb } = await import('../firebase/firebaseAdmin');
      
      const snapshot = await adminDb
        .collection('runclubs')
        .where("creator_id", "==", userId)
        .get();

      const clubs = snapshot.docs.map(doc => {
        const data = doc.data();
        
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      }) as RunClub[];

      return clubs;
    } catch (error) {
      console.error('Error fetching run clubs (server):', error);
      return [];
    }
  } else {
    // Client SDK with App Check (client-side)
    try {
      const { db } = await import('@/app/lib/firebase/firebase');
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      
      const q = query(
        collection(db, 'runclubs'),
        where("creator_id", "==", userId),
        orderBy('name', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RunClub[];
    } catch (error) {
      console.error('Error fetching run clubs (client):', error);
      // Return empty array instead of throwing error
      // User will see server-rendered data from cache
      return [];
    }
  }
}

// Export legacy name for backward compatibility
export const getUserRunClubsUnified = getUserRunClubs;
export const getUserRunClubsServer = getUserRunClubs;