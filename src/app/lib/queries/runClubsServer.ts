import { adminDb } from '../firebaseAdmin';
import { RunClub } from '../types/runClub';
import { convertTimestamp } from '../utils/fireStoreConverter';

export async function getRunClubsServer(): Promise<RunClub[]> {
  try {
    const snapshot = await adminDb
      .collection('runclubs')
      .where('approvedForPublication', '==', true)
      .get();

    const clubs = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // ✅ Use your existing converter helper
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
}