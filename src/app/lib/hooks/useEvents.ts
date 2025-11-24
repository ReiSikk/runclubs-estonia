import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import type { RunClubEvent } from "@/app/lib/types/runClubEvent";

type HookResult = {
  data: RunClubEvent[];
  isLoading: boolean;
  isError: boolean;
};

/**
 * Fetch events that belong to any of the provided runclub IDs.
 * - Splits runclubIds into chunks of 10 to satisfy Firestore "in" query limit of 10
 * - Orders results by "date" descending
 */
export default function useEventsForRunclubs(runclubIds?: string[]): HookResult {
  const [data, setData] = useState<RunClubEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    if (!runclubIds || runclubIds.length === 0) {
      setData([]);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setIsError(false);

    const chunks: string[][] = [];
    for (let i = 0; i < runclubIds.length; i += 10) {
      chunks.push(runclubIds.slice(i, i + 10));
    }

    (async () => {
      try {
        const results: RunClubEvent[] = [];

        for (const chunk of chunks) {
          const q = query(
            collection(db, "events"),
            where("runclub_id", "in", chunk),
            orderBy("date", "desc")
          );
          const snap = await getDocs(q);
          snap.forEach((doc) => {
            const d = doc.data() as any;
            const time =
              (d.startTime ? String(d.startTime) : "") +
              (d.endTime ? ` - ${String(d.endTime)}` : "");
            results.push({
              id: doc.id,
              title: d.title ?? "",
              about: d.description ?? d.about ?? "",
              date: d.date ?? "",
              time: time ?? "",
              location: d.locationName ?? "",
              locationUrl: d.locationUrl ?? undefined,
              runclub_id: d.runclub_id ?? (d.runclub?.id ?? ""),
              runclub: d.runclub ?? "",
            });
          });
        }

        if (!mounted) return;
        setData(results);
        setIsLoading(false);
      } catch (err) {
        console.error("useEventsForRunclubs error:", err);
        if (!mounted) return;
        setIsError(true);
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [runclubIds?.join(",")]);

  return { data, isLoading, isError };
}