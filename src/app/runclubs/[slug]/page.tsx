import { notFound } from 'next/navigation'
// Styles
import styles from './page.module.css'
// Components
import CtaSection from '@/app/components/Page-Home/CtaSection/CtaSection';
import NavBar from '@/app/components/Navbar/NavBar';
// Queries
import { getCurrentRunClub } from '../../lib/queries/currentClub';
import ClubHeader from '@/app/components/Page-Runclub/ClubHeader';


async function SingleRunClubPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const club = await getCurrentRunClub(slug);

  // Define info cards
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

  if (!club) {
    return (
      notFound()
    )
  }

  return (
    <div className={`${styles.page} page-single-runclub`} id="page-top">
      <NavBar />
      <ClubHeader club={club} />
      <main className={`${styles.pageMain}`}>
        <CtaSection variant="white-bg"/>
      </main>
    </div>
  )
}

export default SingleRunClubPage