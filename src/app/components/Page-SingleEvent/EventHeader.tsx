import Image from "next/image";
import { RunClub } from "@/app/lib/types/runClub";
import { RunClubEvent } from "@/app/lib/types/runClubEvent";
import { CalendarDays, Clock, MapPin, Mail, LucideTrendingUp, LucideTimer } from "lucide-react";
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
            {event.image ? (
              <Image src={event.image} alt={event.title} fill className={styles["eventHeader__image-img"]} priority />
            ) : (
              <div className={styles["eventHeader__image-placeholder"]}>No image found</div>
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
                  <Image src={club.logo} alt={club.name} fill style={{ objectFit: "cover" }} />
                ) : (
                  <div className={styles.eventHeader__hostLogoFallback}>{club.name.slice(0, 2).toUpperCase()}</div>
                )}
              </div>
              <div>
                <span className={styles.eventHeader__hostName + " h5"}>{club.name}</span>
              </div>
            </div>
            <button className={styles.eventHeader__contactBtn + " btn_main"}>
              <Mail size={18} />
              <a href={`mailto:${club.email}`}>Contact Organiser</a>
            </button>
          </div>
        </div>

        <div className={styles.eventHeader__right}>
          <div className={styles.eventHeader__main}>
            <h1 className={styles.eventHeader__title}>{event.title}</h1>
            <div className={styles.eventHeader__datetime + " fp"}>
              <div className="fp">
                <CalendarDays size={20} />
                <span className="txt-label">{formatEventDate(event.date)}</span>
              </div>
              <div className="fp">
                <Clock size={20} />
                <span className="txt-label">{event.startTime}</span>
              </div>
            </div>
            <div className={styles.eventHeader__tags}>
              {event.tags?.map((tag) => (
                <span key={tag} className="card-label card-label--big">
                  {tag}
                </span>
              ))}
            </div>
            <span className={styles.eventHeader__subtitle + " h2"}>About this event</span>
            <div className={styles.eventHeader__desc + " txt-body"} dangerouslySetInnerHTML={{ __html: event.description }} />
          </div>
          <div className={styles.eventHeader__cards}>
            {event.distance &&
              <div className={styles.eventHeader__card}>
                <div className={styles.iconLabel + " fp"}>
                  <LucideTrendingUp size={24} color="#faf3e0" />
                  <span className={styles.eventHeader__cardLabel + " txt-label uppercase"}>Distance</span>
                </div>
                <span className={styles.eventHeader__cardValue}>{event.distance} km</span>
              </div>
            }
            {event.pace &&
              <div className={styles.eventHeader__card}>
                <div className={styles.iconLabel + " fp"}>
                  <LucideTimer size={24} color="#faf3e0" />
                  <span className={styles.eventHeader__cardLabel + " txt-label uppercase"}>
                    Pace
                  </span>
                </div>
                <span className={styles.eventHeader__cardValue}>{event.pace}</span>
              </div>
            }
          </div>
          <div className={styles.eventHeader__location}>
            <span className={styles.eventHeader__locationLabel + " txt-label uppercase"}>Meeting point</span>
            <div className={styles.eventHeader__locationBox}>
              <MapPin size={20} />
              <div>
                {event.locationAddress && (
                  <div className={styles.eventHeader__locationAddress}>{event.locationAddress}</div>
                )}
              </div>
            </div>
            <div className={styles.eventHeader__map}>
              <span>Google Maps will be displayed here</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
