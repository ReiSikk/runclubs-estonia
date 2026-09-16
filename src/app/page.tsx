// Components
import MainSection from "./components/Page-Home/MainSection";
import HeroSection  from "./components/Page-Home/HeroSection";
import CtaSection from "./components/CtaSection/CtaSection";
import SiteNav from "./components/Navbar/SiteNav";
// Styles
import styles from "./page.module.css";

export default async function Home() {
  return (
    <>
      <SiteNav />
      <div className={`${styles.page}`} id="page-top">
        <HeroSection />
        <main className={`${styles.main}`}>
          <MainSection />
          <CtaSection />
        </main>
      </div>
    </>
  );
}
