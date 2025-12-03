// TanStack Query
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { cookies } from 'next/headers';
import { adminAuth } from '../lib/firebaseAdmin';
// Hooks 
import { getUserRunClubs } from '../lib/queries/userRunClubs';
import { getEventsForRunClubs } from '../lib/queries/clubEvents';
import DashboardClient from '../components/Dashboard/DashboardClient';
import { RunClub } from '../lib/types/runClub';


export default async function DashboardPage() {
  const queryClient = new QueryClient();

  // Get user from session cookie before prefetching
  let userId: string | null = null;
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (sessionCookie) {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      userId = decodedClaims.uid;
    }
  } catch (error) {
    console.error('Error verifying session:', error);
  }

  // Prefetch user's clubs if authenticated
  if (userId) {
    await queryClient.prefetchQuery({
      queryKey: ['runclubs', userId],
      queryFn: () => getUserRunClubs(userId),
    });

    // Get club IDs from prefetched data
    const clubs = queryClient.getQueryData<RunClub[]>(['runclubs', userId]) ?? [];
    const clubIds = clubs.map((c) => c.id).sort();
    console.log("clubIds:", clubIds);

    // Prefetch events for those clubs
    if (clubIds.length > 0) {
      await queryClient.prefetchQuery({
        queryKey: ['events', clubIds],
        queryFn: () => getEventsForRunClubs(clubIds),
      });
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  );
}
