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
import Link from "next/link";
import { getRunClubs } from "./lib/queries/runClubs";

export default async function Home() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['runclubs'],
    queryFn: getRunClubs,
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
