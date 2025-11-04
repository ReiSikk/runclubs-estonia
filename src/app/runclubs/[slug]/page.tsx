import styles from './page.module.css'
import Link from 'next/link';
import Image from 'next/image';
// Components
import CtaSection from '@/app/components/Page-Home/CtaSection/CtaSection';
import NavBar from '@/app/components/Navbar/NavBar';
import { LucideLink, LucideMoveLeft } from 'lucide-react';
// Sanity
import { urlFor } from "@/sanity/client";
// Queries
import { getCurrentRunClub } from '../../lib/queries/currentClub';


async function SingleRunClubPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const club = await getCurrentRunClub(slug);

  // Check for social icons 
  const hasFacebook = club?.facebook && club.facebook.trim() !== '';
  const hasInstagram = club?.instagram && club.instagram.trim() !== '';
  const hasStrava = club?.strava && club.strava.trim() !== '';
  const hasWebsite = club?.website && club.website.trim() !== '';


  if (!club) {
    return <div>Club not found</div>;
  }

  return (
    <div className={`${styles.page} page-single-runclub`}>
      <NavBar />
      <header className={`${styles.pageHeader} container fp`}>
        <Link href="/" className="back-link back-link--mob" aria-label="Back to home page">
          <div className="icon-carousel-anim left">
            <LucideMoveLeft width={24} height={24} strokeWidth={1.5} className="icon-main"/>
            <LucideMoveLeft width={24} height={24} strokeWidth={1.5} className="icon-hovered"/>
          </div>
          Back
        </Link>
       {club.logo ? (
          <Image
            src={urlFor(club.logo)
              .url()}
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
        <h1 className={styles.pageHeader__title}>{club.name}</h1>
        <p className={styles.pageHeader__description}>{club.description}</p>
        <ul className={`${styles.pageHeader__cards}`}>
          <li className={`${styles.pageHeader__card} fp`}>
            <span className={`${styles.label} uppercase txt-label`}>Schedule</span>
            <div className={styles.right}>
              <h2 className={`${styles.cardTitle} h5`}>
                  {club.days?.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
              </h2>
            </div>
          </li>
          <li className={`${styles.pageHeader__card} fp`}>
            <span className={`${styles.label} uppercase txt-label`}>Meeting Point</span>
            <div className={styles.right}>
              <h2 className={`${styles.cardTitle}`}>{club.location}</h2>
              <p>{club.address}</p>
            </div>
          </li>
          {club.distance &&
            <li className={`${styles.pageHeader__card} fp`}>
              <span className={`${styles.label} uppercase txt-label`}>Distance</span>
              <div className={styles.right}>
                <h2 className={`${styles.cardTitle}`}>{club.distance} kilometers</h2>
                {club.distanceDescription &&
                  <p>{club.distanceDescription}</p>
                }
              </div>
            </li>
          }
        </ul>
        <h3 className={`${styles.pageHeader__subtitle} txt-body`}>Visit our socials to stay in the loop for events!</h3>
        <ul className={`${styles.pageHeader__socials} list-flex`}>
          {hasFacebook && (
          <li className='btn_main socials white'>
            <div className={`${styles.socialIcon} fp`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="url(#facebook-a)" height="24" width="24"><defs><linearGradient x1="50%" x2="50%" y1="97.078%" y2="0%" id="facebook-a"><stop offset="0%" stopColor="#0062E0"/><stop offset="100%" stopColor="#19AFFF"/></linearGradient></defs><path d="M15 35.8C6.5 34.3 0 26.9 0 18 0 8.1 8.1 0 18 0s18 8.1 18 18c0 8.9-6.5 16.3-15 17.8l-1-.8h-4l-1 .8z"/><path fill="#FFF" d="m25 23 .8-5H21v-3.5c0-1.4.5-2.5 2.7-2.5H26V7.4c-1.3-.2-2.7-.4-4-.4-4.1 0-7 2.5-7 7v4h-4.5v5H15v12.7c1 .2 2 .3 3 .3s2-.1 3-.3V23h4z"/></svg>
            </div>
            <a href={club.facebook} target="_blank" rel="noopener noreferrer" className="txt-body" aria-label="Visit our Facebook page">Facebook</a>
          </li>
          )}
          {hasWebsite && (
          <li className='btn_main socials white'>
            <div className={`${styles.socialIcon} fp`}>
              <LucideLink width={24} height={24} strokeWidth={1.5} color='#FAF3E0'/>
            </div>
            <a href={club.website} target="_blank" rel="noopener noreferrer" className="txt-body" aria-label="Visit our website">Website</a>
          </li>
          )}
          {hasInstagram && (
          <li className='btn_main socials white'>
            <div className={`${styles.socialIcon} fp`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" preserveAspectRatio="xMidYMid" viewBox="0 0 256 256"><path fill="#FAF3E0" d="M128 23.064c34.177 0 38.225.13 51.722.745 12.48.57 19.258 2.655 23.769 4.408 5.974 2.322 10.238 5.096 14.717 9.575 4.48 4.479 7.253 8.743 9.575 14.717 1.753 4.511 3.838 11.289 4.408 23.768.615 13.498.745 17.546.745 51.723 0 34.178-.13 38.226-.745 51.723-.57 12.48-2.655 19.257-4.408 23.768-2.322 5.974-5.096 10.239-9.575 14.718-4.479 4.479-8.743 7.253-14.717 9.574-4.511 1.753-11.289 3.839-23.769 4.408-13.495.616-17.543.746-51.722.746-34.18 0-38.228-.13-51.723-.746-12.48-.57-19.257-2.655-23.768-4.408-5.974-2.321-10.239-5.095-14.718-9.574-4.479-4.48-7.253-8.744-9.574-14.718-1.753-4.51-3.839-11.288-4.408-23.768-.616-13.497-.746-17.545-.746-51.723 0-34.177.13-38.225.746-51.722.57-12.48 2.655-19.258 4.408-23.769 2.321-5.974 5.095-10.238 9.574-14.717 4.48-4.48 8.744-7.253 14.718-9.575 4.51-1.753 11.288-3.838 23.768-4.408 13.497-.615 17.545-.745 51.723-.745M128 0C93.237 0 88.878.147 75.226.77c-13.625.622-22.93 2.786-31.071 5.95-8.418 3.271-15.556 7.648-22.672 14.764C14.367 28.6 9.991 35.738 6.72 44.155 3.555 52.297 1.392 61.602.77 75.226.147 88.878 0 93.237 0 128c0 34.763.147 39.122.77 52.774.622 13.625 2.785 22.93 5.95 31.071 3.27 8.417 7.647 15.556 14.763 22.672 7.116 7.116 14.254 11.492 22.672 14.763 8.142 3.165 17.446 5.328 31.07 5.95 13.653.623 18.012.77 52.775.77s39.122-.147 52.774-.77c13.624-.622 22.929-2.785 31.07-5.95 8.418-3.27 15.556-7.647 22.672-14.763 7.116-7.116 11.493-14.254 14.764-22.672 3.164-8.142 5.328-17.446 5.95-31.07.623-13.653.77-18.012.77-52.775s-.147-39.122-.77-52.774c-.622-13.624-2.786-22.929-5.95-31.07-3.271-8.418-7.648-15.556-14.764-22.672C227.4 14.368 220.262 9.99 211.845 6.72c-8.142-3.164-17.447-5.328-31.071-5.95C167.122.147 162.763 0 128 0Zm0 62.27C91.698 62.27 62.27 91.7 62.27 128c0 36.302 29.428 65.73 65.73 65.73 36.301 0 65.73-29.428 65.73-65.73 0-36.301-29.429-65.73-65.73-65.73Zm0 108.397c-23.564 0-42.667-19.103-42.667-42.667S104.436 85.333 128 85.333s42.667 19.103 42.667 42.667-19.103 42.667-42.667 42.667Zm83.686-110.994c0 8.484-6.876 15.36-15.36 15.36-8.483 0-15.36-6.876-15.36-15.36 0-8.483 6.877-15.36 15.36-15.36 8.484 0 15.36 6.877 15.36 15.36Z"/></svg>
            </div>
            <a href={club.instagram} target="_blank" rel="noopener noreferrer" className="txt-body" aria-label="Visit our Instagram page">Instagram</a>
          </li>
          )}
          {hasStrava && (
          <li className='btn_main socials white'>
            <div className={`${styles.socialIcon} ${styles.socialIcon__strava} fp`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="#FAF3E0"><path fill="#FAF3E0" d="M14.18 2L5.9 18h4.88l3.4-6.38L17.56 18h4.84L14.18 2zm8.22 16L20 22.79L17.56 18h-3.7L20 30l6.1-12h-3.7z"/></svg>
            </div>
            <a href={club.strava} target="_blank" rel="noopener noreferrer" className="txt-body" aria-label="Visit our Strava profile">Strava</a>
          </li>
          )}
        </ul>
      </header>
      <main className={`${styles.pageMain} container`}>
        <CtaSection variant="white-bg"/>
      </main>
    </div>
  )
}

export default SingleRunClubPage