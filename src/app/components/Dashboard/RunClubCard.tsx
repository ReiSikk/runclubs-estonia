import { Calendar, LucidePencil, MapPin, Users } from "lucide-react";
import styles from "./RunClubCard.module.css";
import { RunClub } from "@/app/lib/types/runClub";
import { convertDaysToAbbs } from "@/app/lib/utils/convertDays";

interface RunClubCardProps extends RunClub {}

const RunClubCard = ({ id, name, distance, city, area, runDays } : RunClubCardProps) => {

  // Convert run days to abbreviated format
  const daysList = convertDaysToAbbs(runDays);

  return (
    <div
      onClick={() => window.location.href = `/club/${id}`}
      className={`${styles.clubCard} group cursor-pointer`}
    >
      <div className={styles.clubCard__content}>
        <div className={styles.clubCard__header}>
          <div className={`${styles.clubCard__editIcon} fp`}>
            <h3 className={`${styles.clubCard__title} h4`}>
              {name}
            </h3>
            <div className={styles.icon}>
              <LucidePencil size={20} />
            </div>
          </div>
          <p className={`${styles.clubCard__description} txt-small`}>
            {city}, {area} • {distance} km
          </p>
        </div>

        <div className={` ${styles.clubCard__days} fp`}>
          {daysList.map((day) => (
              <li key={day} className={`${styles.day} fp card-label--small`}>
                  {day}
              </li>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RunClubCard;