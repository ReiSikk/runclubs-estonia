import React from "react";
// Next.js
import Image from "next/image";
// Styles
import styles from '@/app/page.module.css'
// Assets
import ctaImage from '@/app/assets/runclub__img.webp'
import { LucideSendHorizonal } from "lucide-react";

function CtaSection({ variant }: { variant?: string }) {
  return (
    <section className={`${styles.ctaSection} container`}>
      <div className={`${styles.ctaSection__wrapper} ${variant === 'white-bg' ? styles.whiteBg : ''} `}>
        <div className={`${styles.ctaSection__main} col-m-12 col-t-6 col-d-6`}>
          <h4 className={`${styles.ctaSection__title} h2 italic`}>Know of a run club we haven&apos;t listed?</h4>
          <p className={styles.ctaSection__text}>
            Help us build the most comprehensive directory of run clubs in Estonia. Submit your club or suggest one you
            know about.
          </p>
            <a href="https://tally.so/r/w87zDO" 
            className={`${styles.ctaSection__btn} btn_main `} target="_blank" 
            rel="noopener noreferrer"   
            data-attr="hero-find-club-click"
            data-custom-id="cta-find-club"
            data-umami-event="CTA to Tally form"
            >
              Let us know!
              <div className="icon-carousel-anim">
                <LucideSendHorizonal width={16} height={16} strokeWidth={1.5}  className="icon-main"/>
                <LucideSendHorizonal width={16} height={16} strokeWidth={1.5}  className="icon-hovered"/>
              </div>
            </a>
        </div>
        <div className={`${styles.ctaSection__side} col-m-12 col-t-6 col-d-6`}>
          <Image
            src={ctaImage}
            alt="Image of people running down a brick road. Photo by Jeremy Bishop on Unsplash"
            width={614}
            height={416}
            className={styles.ctaSection__image}
          />
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
