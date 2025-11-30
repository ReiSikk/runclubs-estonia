import { useQuery } from '@tanstack/react-query';
import { getUserRunClubs } from '../queries/userRunClubs';

export default function useMyRunClubs(userId?: string) {
  return useQuery({
    queryKey: ['runclubs', userId],
    queryFn: () => getUserRunClubs(userId),
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}