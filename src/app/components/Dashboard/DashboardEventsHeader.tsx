import React, { useState } from "react";
import styles from "./DashboardClient.module.css";
import { LucidePlus } from "lucide-react";
import { RunClubEvent } from "@/app/lib/types/runClubEvent";
import { RunClub } from "@/app/lib/types/runClub";
import DashboardEventsFilters from "./DashboardEventsFilters";

type Props = {
  events: RunClubEvent[];
  clubs: RunClub[];
  setShowCreateEvent: (show: boolean) => void;
  onFilterChange: (clubId: string | "all") => void;
};

function DashboardEventsHeader({ events, clubs, setShowCreateEvent, onFilterChange }: Props) {
  const [selectedClubId, setSelectedClubId] = useState<string | "all">("all");

  const handleChange = (clubId: string | "all") => {
    setSelectedClubId(clubId);
    onFilterChange?.(clubId);
  };

  return (
    <header className={`${styles.dashboardEvents__header} ${events.length < 1 ? styles.noEvents : ""} fp-col`}>
      <div className={`${styles.main} fp`}>
        <div className=" fp-col">
            <h2 className="">My events</h2>
            <p className="txt-body">
            {events.length < 1
                ? "You have no upcoming events. Create one to get started!"
                : `You have published ${events.length} event${events.length > 1 ? "s" : ""}.`}
            </p>
        </div>
        <button className={`${styles.dashboardEvents__btn} btn_main accent`} onClick={() => setShowCreateEvent(true)}>
            <LucidePlus size={16} />
            Create Event
        </button>
      </div>
      <div className={styles.dashboardEvents__filters + " fp-col"}>
        <h3 className="txt-body">Show me events for:</h3>
        <DashboardEventsFilters clubs={clubs} selectedClubId={selectedClubId} onChange={handleChange} />
      </div>
    </header>
  );
}

export default DashboardEventsHeader;
