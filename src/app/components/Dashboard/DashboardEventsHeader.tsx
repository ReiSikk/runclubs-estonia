import React, { useState } from "react";
import Link from "next/link";
import styles from "./DashboardClient.module.css";
import { LucidePlus } from "lucide-react";
import { RunClubEvent } from "@/app/lib/types/runClubEvent";
import { RunClub } from "@/app/lib/types/runClub";
import DashboardEventsFilters from "./DashboardEventsFilters";

type Props = {
  events: RunClubEvent[];
  clubs: RunClub[];
  setEventModalToShow: (mode: "create" | "update") => void;
  onFilterChange: (clubId: string | "all") => void;

};

function DashboardEventsHeader({ events, clubs, setEventModalToShow, onFilterChange }: Props) {
  const [selectedClubId, setSelectedClubId] = useState<string | "all">("all");

  const handleChange = (clubId: string | "all") => {
    setSelectedClubId(clubId);
    onFilterChange?.(clubId);
  };

  return (
    <header className={`${styles.dashboardEvents__header} ${events.length < 1 ? styles.noEvents : ""} fp-col`}>
      {clubs.length > 0 && 
      <div className={`${styles.main} fp`}>
        <div className=" fp-col">
            <h2 className="">My events</h2>
            <p className="txt-body">
            {events.length < 1
                ? "You have no upcoming events. Create one to get started!"
                : `You have published ${events.length} event${events.length > 1 ? "s" : ""}.`}
            </p>
        </div>
        <button className={`${styles.dashboardEvents__btn} btn_main accent`} onClick={() => setEventModalToShow("create")}>
            <LucidePlus size={16} />
            Create Event
        </button>
      </div>
      }
      {clubs.length < 1 && 
        <div className="center fp-col">
            <h2 className="h3">No clubs available</h2>
            <p className="txt-body">You need to create a run club before you can create events.</p>
            <Link href="/submit" className="btn_main accent">
              Register a new club
            </Link>
          </div>
      }
      {events.length > 0 && clubs.length > 0 && 
        <div className={styles.dashboardEvents__filters + " fp-col"}>
          <h3 className="txt-body">Showing events for:</h3>
          <DashboardEventsFilters clubs={clubs} selectedClubId={selectedClubId} onChange={handleChange} />
        </div>
      }
    </header>
  );
}

export default DashboardEventsHeader;
