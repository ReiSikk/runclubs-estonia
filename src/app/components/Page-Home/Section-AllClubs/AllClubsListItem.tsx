import React from 'react'
// Next.js
import Image from 'next/image'
import Link from 'next/link'
// Sanity
import { urlFor } from "@/sanity/client";
// Styles
import styles from './AllClubsList.module.css'
// Types
import { RunClub } from '@/app/lib/types'
// Icons
import { LucideArrowRight } from 'lucide-react'


function AllClubsListItem({ club }: { club: RunClub }) {
  const slug = club?.slug?.current;
  const logo = club?.logo;

  // Format days for label list
  const daysList = club.days?.map((day) => {
    const trimmedDay = day.trim();
    const abbreviatedDay = trimmedDay.slice(0, 3);

    return abbreviatedDay.charAt(0).toUpperCase() + abbreviatedDay.slice(1).toLowerCase();
  });


  if (!club) {
    return (
      <li className={styles.allClubsList__item}>
        <p>No club data available</p>
      </li>
    )
  }

  return (
     <li className={styles.allClubsList__item}>
        <Link href={`runclubs/${slug}`} className={`${styles.allClubsList__link} fp-col`}  data-testid="club-link">
          {logo ? (
            <div className={styles.allClubsList__imageWrapper}>
              <Image
                src={urlFor(logo)
                  .url()}
                alt={`${club.name} logo`}
                width={880}
                height={880}
                className={styles.allClubsList__image}
                priority
              />
            </div>

        ) : (
            <div className={styles.allClubsList__imageWrapper}>
              <Image
                unoptimized
                src="https://placehold.co/128x128/svg?text=No+logo+found"
                alt={`${club.name} logo`}
                width={128}
                height={128}
                className={styles.allClubsList__image}
                priority
              />
            </div>
        )}
        <div className={`${styles.allClubsList__info} fp-col`}>
          <span className={`${styles.city} uppercase txt-label`}>{club.city}</span>
          <h4 className='h4'>
            {club.name}
          </h4>
          {daysList && daysList.length > 0 && (
              <ul className={`${styles.allClubsList__days} fp`}>
                {daysList.map((day) => (
                    <li key={day} className={`${styles.allClubsList__day} card-label--small`}>
                        {day}
                    </li>
                ))}
              </ul>
            )}
            <div role="button" className={`${styles.allClubsList__btn} btn_main`} aria-label="Go to run club page to see more info">
              Learn more
              <div className={`${styles.allClubsList__linkIcon} icon-carousel-anim`}>
                <LucideArrowRight width={24} height={24} strokeWidth={1.5} className='icon-hovered'/>
                <LucideArrowRight width={24} height={24} strokeWidth={1.5} className='icon-main'/>
              </div>
            </div>
        </div>
      </Link>
    </li>
  )
}

export default AllClubsListItem