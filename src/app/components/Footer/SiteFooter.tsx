import React from 'react'
import Image from 'next/image'
import { LucideArrowUp, LucideSend } from 'lucide-react'
import styles from './SiteFooter.module.css'

function SiteFooter() {
  return (
    <footer className={`${styles.siteFooter} container`}>
      <div className={`${styles.siteFooter__main} grid`}>
        <div className={`${styles.siteFooter__cell} ${styles.siteFooter__cell_1} fp`}>
          <h4 className={styles.siteFooter__title}>
            Run Clubs <br />
            Estonia
          </h4>
        </div>
        <div className={`${styles.siteFooter__row} fp`}>
          <div className={`${styles.siteFooter__cell} ${styles.siteFooter__cell_2} fp`}>
            <span className='h4'>All rights reserved.
              <br />© {new Date().getFullYear()}</span>
          </div>
          <div className={`${styles.siteFooter__cell} ${styles.siteFooter__cell_3} fp-col`}>
              <p className="h4">
                  This helps cover hosting & domain costs.<br />
                  Thank you 🙏
              </p>
            <a
              className={`${styles.siteFooter__bmac} btn_main`}
              target="_blank"
              href="https://www.buymeacoffee.com/tlnrunclubs"
              rel="noopener noreferrer"
              data-umami-event="Clicked Buy Us A Coffee in Footer"
            >
              <Image
                unoptimized
                height={32}
                width={32}
                className="coffeeImage"
                src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                alt="Coffee icon"
              />
              <span className="txt-body">Buy us a coffee</span>
            </a>
          </div>
        </div>
      </div>
      <div className={`${styles.siteFooter__side} grid`}>
        <div className={`${styles.siteFooter__cell} ${styles.siteFooter__cell_4} ${styles.hover_brightness} fp-col`}>
          <LucideSend size={96} strokeWidth={1} />
          <a href="mailto:sikkrei@gmail.com?subject=Feature request for Run Clubs Estonia" className='h4'>
            Have a feature request?<br />
            Want to suggest a club?<br />
            Have feedback?<br />
            <span>Message us.</span>
          </a>
        </div>
        <div className={`${styles.siteFooter__cell} ${styles.siteFooter__cell_5} ${styles.hover_brightness} fp`}>
          <a href='#page-top' className='h4'>Back to the top</a>
          <LucideArrowUp size={48} strokeWidth={1} />
        </div>
        <div className={`${styles.siteFooter__cell} ${styles.siteFooter__cell_6} ${styles.hover_brightness}`}>
           <a 
            href="https://www.reihopsti.ee" 
            target="_blank" 
            rel="noopener noreferrer" 
            className='h4'
            data-umami-event="Clicked Portfolio link in footer"
            >
              Idea, design & code by <span className=''>Rei Sikk</span>
           </a>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter