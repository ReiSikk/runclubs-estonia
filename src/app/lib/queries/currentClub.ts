import { adminDb } from '../firebaseAdmin';
import { RunClub } from '../types/runClub';
import { convertTimestamp } from '../utils/fireStoreConverter';

export async function getCurrentClub(slug: string): Promise<RunClub | null> {
  try {
    const snapshot = await adminDb
      .collection('runclubs')
      .where('slug', '==', slug)
      .where('approvedForPublication', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Convert timestamps to serializable format
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as RunClub;

  } catch (error) {
    console.error(`[Server] Error fetching club with slug ${slug}:`, error);
    return null;
  }
}