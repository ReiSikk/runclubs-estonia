import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
// Styles
import styles from './page.module.css'
// Components
import CtaSection from '@/app/components/CtaSection/CtaSection';
import NavBar from '@/app/components/Navbar/NavBar';
// Queries
import { getCurrentClub } from '../../lib/queries/currentClub';
import ClubHeader from '@/app/components/Page-Runclub/ClubHeader';
import EventsSection from '@/app/components/Page-Runclub/Events';

type PageProps = {
  params: Promise<{ slug: string }>
}


export default function SingleRunClubPage({ params }: PageProps) {
  return (
    <Suspense fallback={<ClubPageFallback />}>
      <ClubPageContent params={params} />
    </Suspense>
  )
}

async function ClubPageContent({ params }: PageProps) {
  await connection();
  const { slug } = await params;
  const club = await getCurrentClub(slug);

  if (!club) {
    return (
      notFound()
    )
  }

  return (
    <div className={`${styles.page} page-single-runclub`} id="page-top">
      <NavBar backTo='/'/>
      <ClubHeader club={club} />
      <main className={`${styles.pageMain}`}>
        <CtaSection variant="white-bg"/>
        <EventsSection club={club} />
      </main>
    </div>
  )
}

function ClubPageFallback() {
  return <main className={`${styles.page} page-single-runclub`} id="page-top" />;
}