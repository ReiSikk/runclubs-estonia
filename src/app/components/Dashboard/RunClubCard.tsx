import { LucidePencil } from "lucide-react";
import styles from "./RunClubCard.module.css";
import { RunClub } from "@/app/lib/types/runClub";
import { convertDaysToAbbs } from "@/app/lib/utils/convertDays";

const RunClubCard = ({ name, distance, city, area, runDays, approvedForPublication } : RunClub) => {
  // Convert run days to abbreviated format
  const daysList = convertDaysToAbbs(runDays);

  // Determine status label class
  const statusClass = approvedForPublication ? styles.approved : styles.pending;

  return (
    <div
      className={`${styles.clubCard}`}
    >
      <div className={`${styles.clubCard__header} fp`}>
        <div className={`${styles.clubCard__status} ${statusClass} fp`}>
          {approvedForPublication ? "Approved" : "Pending"}
        </div>
        <div className={styles.icon}>
          <LucidePencil size={20} />
        </div>
      </div>
      <div className={styles.clubCard__content}>
          <h3 className={`${styles.clubCard__title} h4`}>
            {name}
          </h3>
          <p className={`${styles.clubCard__description} txt-small`}>
            {city}, {area} • {distance} km
          </p>
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