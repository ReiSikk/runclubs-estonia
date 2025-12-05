"use client";

import styles from "../../runclubs/[slug]/page.module.css";
import RunClubEventCard from "../Dashboard/RunClubEvent";
import { CalendarPlus } from "lucide-react";
import { useSingleClubEvents } from "@/app/lib/hooks/useSingleClubEvents";

interface UpcomingEventsProps {
  clubId: string;
  clubName: string;
  slug?: string;
}

export default function EventsSection({ clubId, clubName, slug }: UpcomingEventsProps) {
  const { data: events = [], isLoading, isError } = useSingleClubEvents(clubId);

  if (isLoading) {
    return (
      <section className={styles.upcomingEvents + " container"}>
        <p>Loading events...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.upcomingEvents + " container"}>
        <p>Failed to load events</p>
      </section>
    );
  }

  return (
    <section className={styles.upcomingEvents + " container"}>
      <div className={styles.upcomingEvents__header}>
        <h2 className={styles.upcomingEvents__title}>
          {`Upcoming events ${events.length > 0 ? `(${events.length})` : ''}`}
        </h2>
      </div>

      {events.length > 0 ? (
        <div className={styles.upcomingEvents__list}>
          {events.map((event) => (
            <RunClubEventCard 
              key={event.id} 
              event={event} 
              showActions={false}  
              slug={slug}
              />
          ))}
        </div>
      ) : (
        <div className={styles.upcomingEvents__empty}>
          <CalendarPlus size={32} />
          <p>No upcoming events for {clubName}</p>
          <span>Check back soon for new runs!</span>
        </div>
      )}
    </section>
  );
}