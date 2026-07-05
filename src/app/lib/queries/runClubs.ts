import { RunClub } from '@/app/lib/types/runClub';
import { convertTimestamp } from '../utils/fireStoreConverter';

// ✅ Unified query function that works on both server and client
export async function getRunClubs(): Promise<RunClub[]> {
  if (typeof window === 'undefined') {
    // ✅ SERVER-SIDE: Use Admin SDK
    try {
      const { adminDb } = await import('../firebase/firebaseAdmin');
      
      const snapshot = await adminDb
        .collection('runclubs')
        .where('approvedForPublication', '==', true)
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
    // ✅ CLIENT-SIDE: Use Client SDK with App Check
    try {
      const { db } = await import('@/app/lib/firebase/firebase');
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      
      const q = query(
        collection(db, 'runclubs'),
        where('approvedForPublication', '==', true),
        orderBy('name', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RunClub[];
    } catch (error) {
      console.error('Error fetching run clubs (client):', error);
      // Return empty array instead of throwing
      // User still sees server-rendered data from cache
      return [];
    }
  }
}

// ✅ Export legacy name for backward compatibility
export const getRunClubsUnified = getRunClubs;
export const getRunClubsServer = getRunClubs;