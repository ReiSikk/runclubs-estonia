import Image from 'next/image';
// Components
import SocialsList from './SocialsList';
// Types
import { RunClub } from '@/app/lib/types/runClub';
import { EventInfoCard } from '@/app/lib/types/eventInfoCard';
import { RunClubEvent } from '@/app/lib/types/runClubEvent';
// Styles
import styles from '../../runclubs/[slug]/page.module.css';

interface ClubHeaderProps {
  club: RunClub;
  eventHeader?: boolean;
  event?: RunClubEvent;
}

export default function ClubHeader({ club, eventHeader, event }: ClubHeaderProps) {


const infoCards = [
  {
    id: 'schedule',
    label: 'Schedule',
    title: club?.runDays?.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', '),
    description: club?.startTime ? `Usually starts at ${club.startTime}` : null,
    show: club?.runDays && club.runDays.length > 0
  },
  {
    id: 'area',
    label: 'Meeting Point',
    title: club?.area,
    description: club?.address,
    show: club?.area || club?.address
  },
  {
    id: 'distance',
    label: 'Distance',
    title: club?.distance ? `${club.distance} kilometers` : null,
    description: club?.distanceDescription,
    show: club?.distance
  }
].filter(card => card.show);

  let eventInfoCards: EventInfoCard[] = [];

  if (eventHeader && event) {
    eventInfoCards = [
      {
        id: 'date',
        label: 'Event Date',
        title: event?.date ?? null, // Safe: undefined -> null
        show: !!event?.date
      },
      {
        id: 'time',
        label: 'Event Time',
        title: event?.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}` : null,
        show: !!event?.startTime
      },
      {
        id: 'location',
        label: 'Event Location',
        title: event?.locationName ?? null, // Safe: undefined -> null
        description: event?.locationUrl ?? null,
        show: !!event?.locationName
      }
    ].filter(card => card.show);
  }


  return (
    <header className={`${styles.pageHeader} container fp`}>
      {club.logo && !eventHeader ? (
        <div className={styles.pageHeader__imgwrapper}>
          <Image
            src={club.logo}
            alt={`${club.name} logo`}
            width={614}
            height={416}
            className={styles.pageHeader__image}
            priority
          />
        </div>
      ) : (
        <div className={styles.pageHeader__imgwrapper}>
          <Image
            unoptimized
            src="https://placehold.co/614x416/svg?text=No+image+found"
            alt={`${club.name} logo`}
            width={614}
            height={416}
            className={styles.pageHeader__image}
            priority
          />
        </div>
      )}
      <div className={`${styles.pageHeader__titledes} fp-col`}>
        <h1 className={styles.pageHeader__title}>
          {!eventHeader ? club.name : `${event?.title} by ${club.name}`}
        </h1>
        <p className={styles.pageHeader__description}>
          {club.description}
        </p>
      </div>
      {!eventHeader && infoCards.length > 0 && (
        <ul className={`${styles.pageHeader__cards}`}>
          {infoCards.map((card) => (
            <li key={card.id} className={`${styles.pageHeader__card} fp`}>
              <span className={`${styles.label} uppercase txt-label`}>
                {card.label}
              </span>
              <div className={styles.card_main}>
                {card.title && (
                  <h2 className={`${styles.cardTitle} h4`}>
                    {card.title}
                  </h2>
                )}
                {card.description && (
                  <p>{card.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {eventHeader && (
           <ul className={`${styles.pageHeader__cards}`}>
          {eventInfoCards.map((card) => (
            <li key={card.id} className={`${styles.pageHeader__card} fp`}>
              <span className={`${styles.label} uppercase txt-label`}>
                {card.label}
              </span>
              <div className={styles.card_main}>
                {card.title && (
                  <h2 className={`${styles.cardTitle} h4`}>
                    {card.title}
                  </h2>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <SocialsList 
        facebook={club.facebook}
        instagram={club.instagram}
        strava={club.strava}
        website={club.website}
      />
    </header>
  );
}