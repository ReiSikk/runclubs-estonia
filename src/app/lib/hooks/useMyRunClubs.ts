import { useQuery } from '@tanstack/react-query';
import { getUserRunClubs } from '../queries/userRunClubs';

export default function useMyRunClubs(userId?: string) {
  console.log('useMyRunClubs called with userId:', userId); // Debug

  return useQuery({
    queryKey: ['runclubs', userId],
    queryFn: () => {
      return getUserRunClubs(userId);
    },
    staleTime: 5 * 60 * 1000, // 5 mins
    gcTime: 10 * 60 * 1000, // avoid the cache from growing
    enabled: !!userId,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
}