'use client';

import { useQuery } from '@tanstack/react-query';
import { getRunClubs } from '../queries/runClubs';

export default function useRunClubs() {
  return useQuery({
    queryKey: ['runclubs'],
    queryFn: getRunClubs,
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}