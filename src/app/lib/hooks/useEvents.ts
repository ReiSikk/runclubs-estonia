import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import type { RunClubEvent } from "@/app/lib/types/runClubEvent";

type HookResult = {
  data: RunClubEvent[];
  isLoading: boolean;
  isError: boolean;
};

export default function useEventsForRunclubs(runclubIds?: string[]): HookResult {
  const [data, setData] = useState<RunClubEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // stable primitive dependency — avoids re-running effect when a new array reference is passed
  const idsKey = useMemo(() => (runclubIds && runclubIds.length ? runclubIds.join("|") : ""), [runclubIds]);

  useEffect(() => {
    if (!idsKey) {
      setData([]);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    (async () => {
      try {
        const ids = idsKey.split("|");
        const chunks: string[][] = [];
        for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

        const results: RunClubEvent[] = [];
        for (const chunk of chunks) {
          const q = query(collection(db, "events"), where("runclub_id", "in", chunk), orderBy("date", "desc"));
          const snap = await getDocs(q);
          snap.forEach((doc) => {
            const d = doc.data();
            const time = (d.startTime ? String(d.startTime) : "") + (d.endTime ? ` - ${String(d.endTime)}` : "");
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

        if (!cancelled) setData(results);
      } catch (err) {
        console.error("useEventsForRunclubs error:", err);
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  return { data, isLoading, isError };
}