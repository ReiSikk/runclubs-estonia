import { useQuery } from '@tanstack/react-query';
import { getEventsForRunClubs } from '../queries/clubEvents';

export default function useClubEvents(clubIds: string[] = []) {
    // Filter out undefined/null and excluded IDs
  const validIds = clubIds.filter(id => id && id.trim());
  
  // Sort for consistent query key
  const sortedIds = [...validIds].sort();

  return useQuery({
    queryKey: ['events', sortedIds],
    queryFn: () => getEventsForRunClubs(sortedIds),
    staleTime: 5 * 60 * 1000, // 5 mins
    gcTime: 10 * 60 * 1000, // avoid the cache from growing
    enabled: sortedIds.length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}