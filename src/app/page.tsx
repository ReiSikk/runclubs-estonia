// Components
import MainSection from "./components/Page-Home/MainSection";
import HeroSection  from "./components/Page-Home/HeroSection";
import CtaSection from "./components/Page-Home/CtaSection";
import WeatherWidget from "./components/Navbar/WeatherWidget";
// Styles
import styles from "./page.module.css";
// TanStack Query
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { getRunClubs } from "./lib/queries/runClubs";

export default async function Home() {
  const queryClient = new QueryClient()

  // Prefetch data on server for instant loading
  await queryClient.prefetchQuery({
    queryKey: ['runClubs'],
    queryFn: getRunClubs,
  })


  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    <div className={`${styles.page}`}>
      <header className={`${styles.header} container`}>
        <WeatherWidget />
      </header>
      <main className={`${styles.main}`}>
        <HeroSection />
        <MainSection />
        <CtaSection />
      </main>
    </div>
    </HydrationBoundary>
  );
}
