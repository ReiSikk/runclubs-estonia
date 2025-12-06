import Image from "next/image";
import { RunClub } from "@/app/lib/types/runClub";
import { RunClubEvent } from "@/app/lib/types/runClubEvent";
import { CalendarDays, Clock, MapPin, Mail } from "lucide-react";
import { formatEventDate } from "@/app/lib/utils/convertTime";
import styles from "./EventHeader.module.css";

type Props = {
  club: RunClub;
  event: RunClubEvent;
};

export default function EventHeader({ club, event }: Props) {
  return (
    <section className={styles.eventHeader}>
      <div className={styles.eventHeader__container}>
        <div className={styles.eventHeader__left}>
          <div className={styles.eventHeader__image}>
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className={styles["eventHeader__image-img"]}
                priority
              />
            ) : (
              <div className={styles["eventHeader__image-placeholder"]}>
                No image found
              </div>
            )}
            {/* <div className={styles.eventHeader__actions}>
              <button className={styles["eventHeader__action-btn"]} aria-label="Share">
                <Share2 size={20} />
              </button>
              <button className={styles["eventHeader__action-btn"]} aria-label="Favorite">
                <Heart size={20} />
              </button>
            </div> */}
          </div>
          <div className={styles.eventHeader__host}>
            <span className={styles.eventHeader__hostLabel + " txt-label"}>HOSTED BY</span>
            <div className={styles.eventHeader__hostInner}>
              <div className={styles.eventHeader__hostLogo}>
                {club.logo ? (
                  <Image src={club.logo} alt={club.name} width={48} height={48} />
                ) : (
                  <div className={styles.eventHeader__hostLogoFallback}>
                    {club.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <span className={styles.eventHeader__hostName + " h5"}>{club.name}</span>
              </div>
            </div>
            <button className={styles.eventHeader__contactBtn}>
              <Mail size={18} /> Contact Organiser
            </button>
          </div>
          <div className={styles.eventHeader__tags}>
            {event.tags?.map(tag => (
              <span key={tag} className={styles["eventHeader__tag"] + " tag"}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.eventHeader__right}>
          <div className={styles.eventHeader__main}>
            <h1 className={styles.eventHeader__title}>{event.title}</h1>
            <div className={styles.eventHeader__datetime}>
              <CalendarDays size={18} />
              <span className="txt-label">{formatEventDate(event.date)}</span>
              <Clock size={18} style={{ marginLeft: "1.2rem" }} />
              <span className="txt-label">{event.startTime}</span>
            </div>
            <div className={styles.eventHeader__desc + " txt-body"}>
              {event.about}
            </div>
          </div>
          <div className={styles.eventHeader__cards}>
            <div className={styles.eventHeader__card}>
              <span className={styles.eventHeader__cardValue}>{event.distance} km</span>
              <span className={styles.eventHeader__cardLabel + " h5"}>Distance</span>
            </div>
            <div className={styles.eventHeader__card}>
              <span className={styles.eventHeader__cardValue}>{event.pace}</span>
              <span className={styles.eventHeader__cardLabel + " h5"}>Pace</span>
            </div>
          </div>
          <div className={styles.eventHeader__location}>
            <span className={styles.eventHeader__locationLabel + " txt-label"}>LOCATION</span>
            <div className={styles.eventHeader__locationBox}>
              <MapPin size={20} />
              <div>
                <div className={styles.eventHeader__locationAddress}>{event.locationAddress}</div>
                {event.locationAddress && (
                  <div className={styles.eventHeader__locationAddress}>{event.locationAddress}</div>
                )}
              </div>
            </div>
            <div className={styles.eventHeader__mapPlaceholder}>
              <MapPin size={32} />
              <span>Google Maps will be displayed here</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}