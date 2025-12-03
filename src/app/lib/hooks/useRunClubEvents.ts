import { useQuery } from '@tanstack/react-query';
import { getEventsForRunClubs } from '../queries/clubEvents';

export default function useClubEvents(clubIds: string[] = []) {
   // Sort IDs to ensure consistent query key
  const sortedIds = [...clubIds].sort();

  return useQuery({
    queryKey: ['events', sortedIds],
    queryFn: () => getEventsForRunClubs(sortedIds),
    staleTime: 5 * 60 * 1000, // 5 mins
    gcTime: 10 * 60 * 1000, // avoid the cache from growing
    enabled: sortedIds.length > 0,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}