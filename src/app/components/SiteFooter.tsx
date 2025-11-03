import React from 'react'
import Image from 'next/image'

function SiteFooter() {
  return (
    <footer className="siteFooter container">
        <div className="sitefooter__main fp-col">
          <h4 className="siteFooter__title h1 uppercase italic">Run Clubs Est</h4>
          <a href="https://www.reihopsti.ee" target="_blank" rel="noopener noreferrer" data-umami-event="Clicked Portfolio link in footer">Idea, design & code by <span className='underline'>Rei Sikk</span></a>
          <span>All rights reserved © {new Date().getFullYear()}</span>
        </div>
        <div className="siteFooter__side fp-col">
        <a
          className="siteFooter__bmac btn_main"
          target="_blank"
          href="https://www.buymeacoffee.com/tlnrunclubs"
          rel="noopener noreferrer"
          data-umami-event="Clicked Buy Me A Coffee in Footer"
        >
          <Image
            unoptimized
            height={32}
            width={32}
            className="coffeeImage"
            src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
            alt="Icon"
          />
          <span className="txt-body">Buy me a coffee</span>
        </a>
        <p className="siteFooter__text">
            This helps cover hosting & domain costs.<br /> Thank you 🙏
        </p>
        </div>
    </footer>
  )
}

export default SiteFooter