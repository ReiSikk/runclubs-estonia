// Components
import MainSection from "./components/Page-Home/MainSection";
import HeroSection  from "./components/Page-Home/HeroSection";
import CtaSection from "./components/CtaSection/CtaSection";
// Styles
import styles from "./page.module.css";
// TanStack Query
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
// Queries
import { getRunClubsServer } from "./lib/queries/runClubsServer";
import Link from "next/link";

export default async function Home() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['runclubs'],
    queryFn: getRunClubsServer,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className={`${styles.page}`} id="page-top">
          <nav className={`${styles.pageNav} container`}>
            <Link href="/submit" className={`${styles.pageNav__link}`} aria-label="Register your running club">
              Add your club
            </Link>
          </nav>
        <HeroSection />
        <main className={`${styles.main}`}>
          <MainSection />
          <CtaSection />
        </main>
      </div>
    </HydrationBoundary>
  );
}
