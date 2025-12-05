import Link from "next/link";
import { RunClub } from "@/app/lib/types/runClub";
import { RunClubEvent } from "@/app/lib/types/runClubEvent";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import ClubHeader from "@/app/components/Page-Runclub/ClubHeader"; // Import ClubHeader
import styles from "./EventDetail.module.css"; // Keep event-specific styles

type Props = {
  club: RunClub;
  event: RunClubEvent;
};

export default function EventDetail({ club, event }: Props) {
  return (
    <div className={styles.page}>
      {/* Reuse ClubHeader for consistent club branding */}
      <ClubHeader club={club} eventHeader={true} event={event} />

      {/* Event Hero - Event-specific details */}
      <section className={styles.hero + " container"}>
        <h1 className={styles.title}>{event.title}</h1>
        
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <CalendarDays size={20} />
            <span>{event.date}</span> {/* Simplified; add formatEventDate if needed */}
          </div>
          
          <div className={styles.metaItem}>
            <Clock size={20} />
            <span>
              {event.startTime}
              {event.endTime && ` - ${event.endTime}`}
            </span> {/* Simplified; add formatTime if needed */}
          </div>
          
          <div className={styles.metaItem}>
            <MapPin size={20} />
            {event.locationUrl ? (
              <a href={event.locationUrl} target="_blank" rel="noopener noreferrer">
                {event.locationName}
              </a>
            ) : (
              <span>{event.locationName}</span>
            )}
          </div>
        </div>
      </section>

      {/* Event Body */}
      <section className={styles.body + " container"}>
        <h2 className="h4">About this event</h2>
        <p className={styles.about}>{event.about}</p>
      </section>

      {/* CTA Section */}
      <section className={styles.cta + " container"}>
        <Link href={`/runclubs/${club.slug}`} className="btn_main accent">
          View {club.name}
        </Link>
        
        <button className="btn_main white">
          Share Event
        </button>
      </section>
    </div>
  );
}