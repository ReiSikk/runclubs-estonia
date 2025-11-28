"use client";

import React, { useEffect, useState } from 'react'
import Link from "next/link";
import styles from './SiteNav.module.css'
import { LucideHome, LucidePencil, LucideUser, LayoutDashboard, LucideLogOut } from 'lucide-react'
import { Tooltip } from "radix-ui";
import { useAuth } from '@/app/providers/AuthProvider';
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";

function SiteNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
        try {
        await auth.signOut();
        router.push("/login");
        } catch (error) {
        console.error("Error signing out:", error);
        }
    };


  return (
    <div className={`${styles.siteNav} ${isVisible ? `${styles.visible}` : `${styles.hidden}`}`}>
        <nav className={`${styles.siteNav__nav} fp`} role="menu" aria-expanded={isVisible} aria-hidden={!isVisible}>
            <Link className={`${styles.siteNav__link} btn_main`} href="/" role="menulink">
                <LucideHome size={16} />
                Home
            </Link>
            <Tooltip.Provider delayDuration={500}>
			    <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <Link className={`${styles.siteNav__link} ${styles.icon} fp`} href="/submit" role="menulink">
                            <LucidePencil size={16} />
                        </Link>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                        <Tooltip.Content className={styles.Content} sideOffset={5}>
                            Submit a new run club
                            <Tooltip.Arrow className={styles.Arrow} />
                        </Tooltip.Content>
				    </Tooltip.Portal>
                </Tooltip.Root>
		    </Tooltip.Provider>
            <Tooltip.Provider delayDuration={500}>
			    <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                         <Link className={`${styles.siteNav__link} ${styles.icon} fp`} href="/dashboard" role="menulink">
                            <LayoutDashboard size={16} />
                        </Link>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                        <Tooltip.Content className={styles.Content} sideOffset={5}>
                            My dashboard
                            <Tooltip.Arrow className={styles.Arrow} />
                        </Tooltip.Content>
				    </Tooltip.Portal>
                </Tooltip.Root>
		    </Tooltip.Provider>
            {!user && 
                <Link className={`${styles.siteNav__link} btn_main`} href="/login" role="menulink">
                    <LucideUser size={16} />
                    Sign in
                </Link>
            }
            {user && 
            <div className={`${styles.siteNav__link} btn_main`} role="menuitem">
                <LucideLogOut size={16} className={styles.item__icon} />
                <div onClick={() => handleLogout()} className="h4">
                    Log out
                </div>
            </div>
            }
        </nav>
    </div>
  )
}

export default SiteNav