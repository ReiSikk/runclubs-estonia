import { Calendar, MapPin, Users } from "lucide-react";
import styles from "./RunClubCard.module.css";
import { RunClub } from "@/app/lib/types/runClub";

interface RunClubCardProps extends RunClub {}

const RunClubCard = ({ id, name, description, city } : RunClubCardProps) => {
  return (
    <div
      onClick={() => window.location.href = `/club/${id}`}
      className={`${styles.clubCard} group cursor-pointer`}
    >
      <div className={styles.clubCard__content}>
        <div className={styles.clubCard__header}>
          <h3 className={`${styles.clubCard__title} h4`}>
            {name}
          </h3>
          <p className={styles.clubCard__description}>
            {description}
          </p>
        </div>

        <div className={styles.clubCard__meta}>
          {city && <div className={styles.clubCard__location}>
            <MapPin className={styles.clubCard__icon} />
            <span>{city}</span>
          </div>
          }

          {/* <div className={styles.clubCard__members}>
            <Users className={styles.clubCard__icon} />
            <span>{memberCount} members</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default RunClubCard;