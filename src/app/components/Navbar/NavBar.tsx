"use client"

import React from 'react'
import { useEffect, useState } from 'react'
// Next.js
import Image from 'next/image';
import Link from 'next/link';
// Assets
import LogoImg from '@/app/assets/runclubs__logo.svg';
import { LucideMoveLeft } from 'lucide-react';

function NavBar() {
    const [isScrolled, setScrolled] = useState(false);

    const handleScroll = () => {
    if(window.pageYOffset > 200) {
        setScrolled(true)
    } else {
        setScrolled(false)
    }
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

  return (
      <nav className={`siteNav fp container ${isScrolled ? 'siteNav--scrolled' : ''}`}>
        <Link href="/" className="back-link" aria-label="Back to home page">
          <div className="icon-carousel-anim left">
            <LucideMoveLeft width={24} height={24} strokeWidth={1.5} className="icon-main"/>
            <LucideMoveLeft width={24} height={24} strokeWidth={1.5} className="icon-hovered"/>
          </div>
          Back
        </Link>
        <Link className="siteNav__logo" href={'/'}>
          <Image 
            src={LogoImg} 
            alt="Link to home page. Run clubs Estonia logo" 
            width={64}
            height={64}
            className=''
            priority 
            /> 
        </Link>
      </nav>
  )
}

export default NavBar