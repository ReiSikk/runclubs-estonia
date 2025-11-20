"use client"

import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation";
// Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
// Next.js
import Image from 'next/image';
import Link from 'next/link';
// Assets
import LogoImg from '@/app/assets/runclubs__logo.svg';
import { LucideLogOut, LucideMoveLeft } from 'lucide-react';
import { User } from "firebase/auth";


function NavBar() {
    const [isScrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(null);

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


  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setUser(user as User);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
        {user &&
          <button className="logout__btn btn_small" onClick={handleLogout}><LucideLogOut size={16} />Log out</button>
        }
      </nav>
  )
}

export default NavBar