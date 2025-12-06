import { RunClub } from "@/app/lib/types/runClub";
import { RunClubEvent } from "@/app/lib/types/runClubEvent";
import styles from "./EventDetail.module.css";
import EventHeader from "./EventHeader";
import CtaSection from "../CtaSection/CtaSection";

type Props = {
  club: RunClub;
  event: RunClubEvent;
};

export default function EventDetail({ club, event }: Props) {
  return (
    <div className={styles.page + " container"}>
      <EventHeader club={club} event={event} />

      <section className={styles.body + " container"}>
        <h2 className="h3">About this event</h2>
        <p className={styles.about}>{event.about}</p>
      </section>

      <CtaSection variant="light-bg"/>
    </div>
  );
}