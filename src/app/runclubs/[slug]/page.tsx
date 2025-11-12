import { notFound } from 'next/navigation'
// Styles
import styles from './page.module.css'
// Components
import CtaSection from '@/app/components/Page-Home/CtaSection/CtaSection';
import NavBar from '@/app/components/Navbar/NavBar';
// Queries
import { getCurrentRunClub } from '../../lib/queries/currentClub';
import ClubHeader from '@/app/components/Page-Runclub/ClubHeader';

type PageProps = {
  params: Promise<{ slug: string }>
}


export default async function SingleRunClubPage({ params }: PageProps) {
  const { slug } = await params;
  // Fetch current club data
  const club = await getCurrentRunClub(slug);

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