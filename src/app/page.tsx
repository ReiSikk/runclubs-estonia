// Components
import MainSection from "./components/Page-Home/MainSection";
import HeroSection  from "./components/Page-Home/HeroSection";
import CtaSection from "./components/CtaSection/CtaSection";
import SiteNav from "./components/Navbar/SiteNav";
// Styles
import styles from "./page.module.css";
// TanStack Query
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
// Queries
import { getRunClubs } from "./lib/queries/runClubs";

export default async function Home() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['runclubs'],
    queryFn: getRunClubs,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SiteNav />
      <div className={`${styles.page}`} id="page-top">
        <HeroSection />
        <main className={`${styles.main}`}>
          <MainSection />
          <CtaSection />
        </main>
      </div>
    </HydrationBoundary>
  );
}
