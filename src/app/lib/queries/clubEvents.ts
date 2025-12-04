import { RunClubEvent } from '@/app/lib/types/runClubEvent';
import { convertTimestamp } from '../utils/fireStoreConverter';

export async function getEventsForRunClubs(clubIds: string[]): Promise<RunClubEvent[]> {
  if (!clubIds || clubIds.length === 0) return [];
    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split("T")[0]; // "2025-12-04"

  if (typeof window === 'undefined') {
    // Admin SDK (server-side)
    try {
      const { adminDb } = await import('../firebaseAdmin');
      
      const snapshot = await adminDb
        .collection('events')
        .where('runclub_id', 'in', clubIds)
        .where("date", ">=", todayISO)
        .orderBy('date', 'asc')
        .get();

      const events = snapshot.docs.map(doc => {
        const data = doc.data();
        
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      }) as RunClubEvent[];

      return events;
    } catch (error) {
      console.error('Error fetching events (server):', error);
      return [];
    }
  } else {
    // Client SDK (client-side)
    try {
      const { db } = await import('@/app/lib/firebase');
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      
      const q = query(
        collection(db, 'events'),
        where('runclub_id', 'in', clubIds),
        where("date", ">=", todayISO),
        orderBy('date', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RunClubEvent[];
    } catch (error) {
      console.error('Error fetching events (client):', error);
      return [];
    }
  }
}