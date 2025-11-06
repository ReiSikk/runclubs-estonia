import Image from 'next/image';
// Components
import SocialsList from './SocialsList';
// Types
import { RunClub } from '@/app/lib/types/runClub';
// Styles
import styles from '../../runclubs/[slug]/page.module.css';
// Sanity
import { urlFor } from "@/sanity/client";

interface ClubHeaderProps {
  club: RunClub;
}

export default function ClubHeader({ club }: ClubHeaderProps) {
  const infoCards = [
    {
      id: 'schedule',
      label: 'Schedule',
      title: club?.days?.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', '),
      description: null,
      show: club?.days && club.days.length > 0
    },
    {
      id: 'location',
      label: 'Meeting Point',
      title: club?.location,
      description: club?.address,
      show: club?.location || club?.address
    },
    {
      id: 'distance',
      label: 'Distance',
      title: club?.distance ? `${club.distance} kilometers` : null,
      description: club?.distanceDescription,
      show: club?.distance
    }
  ].filter(card => card.show);

  return (
    <header className={`${styles.pageHeader} container fp`}>
      {club.logo ? (
        <Image
          src={urlFor(club.logo).url()}
          alt={`${club.name} logo`}
          width={614}
          height={416}
          className={styles.pageHeader__image}
          priority
        />
      ) : (
        <Image
          unoptimized
          src="https://placehold.co/200x200/svg?text=No+image+found"
          alt={`${club.name} logo`}
          width={614}
          height={416}
          className={styles.pageHeader__image}
          priority
        />
      )}
      <div className={`${styles.pageHeader__titledes} fp-col`}>
        <h1 className={styles.pageHeader__title}>
          {club.name}
        </h1>
        <p className={styles.pageHeader__description}>
          {club.description}
        </p>
      </div>
      {infoCards.length > 0 && (
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
      <SocialsList 
        facebook={club.facebook}
        instagram={club.instagram}
        strava={club.strava}
        website={club.website}
      />
    </header>
  );
}