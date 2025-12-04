import { useQuery } from "@tanstack/react-query";
import { getSingleClubEvents } from "../queries/singleClubEvents";
import { RunClubEvent } from "../types/runClubEvent";

export function useSingleClubEvents(clubId: string) {
  return useQuery<RunClubEvent[], Error>({
    queryKey: ["singleClubEvents", clubId],
    queryFn: () => getSingleClubEvents(clubId),
    enabled: !!clubId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}