"use client";

import { useMemo } from "react";
import styles from "./DashboardClient.module.css";
import type { RunClub } from "@/app/lib/types/runClub";

type Props = {
  clubs: RunClub[];
  selectedClubId: string | "all";
  onChange: (clubId: string | "all") => void;
};

export default function DashboardEventsFilters({ clubs, selectedClubId, onChange }: Props) {
  const options = useMemo(() => [
    { id: "all", name: "All my clubs" },
    ...clubs.map(c => ({ id: c.id, name: c.name })),
  ], [clubs]);

  return (
    <div className={styles.dashboardEvents__filters} role="tablist" aria-label="Filter events by club">
      {options.map(opt => {
        const active = selectedClubId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${styles.pill} ${active ? styles.pill__active : ""}`}
            onClick={() => onChange(opt.id as string | "all")}
          >
            {opt.name}
          </button>
        );
      })}
    </div>
  );
}