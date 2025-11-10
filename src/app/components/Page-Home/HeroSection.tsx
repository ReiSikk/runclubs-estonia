import Link from 'next/link';
import styles from './HeroSection.module.css';

function HeroSection () {
  return (
    <section className={`${styles.heroSection}`}>
      <div className={styles.heroSection__overlay}></div>
      <div className={`${styles.heroSection__wrapper} container`}>
        <div className={`${styles.hero__main} fp-col`}>
          <h1 className={`${styles.hero__title}`}>Find Your Running Community in Estonia</h1>    
          <div className={`${styles.hero__actions} fp`}>
            <p className="txt-body">Join fellow runners across Estonia and discover local clubs that match your pace and goals. Whether you&apos;re training for your first 5K or logging weekly miles with friends, there&apos;s a club waiting to welcome you.</p>
            <div className={`${styles.buttons} fp`}>
              <a href="#home-clubs-list" 
                className="btn_main cream"
              >
                Find a Club
              </a>
              <Link
                href="/submit"
                className={`${styles.hero__submitButton} btn_main`}
              >
                Submit a new club
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default HeroSection;