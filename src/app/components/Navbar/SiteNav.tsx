"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import styles from "./SiteNav.module.css";
import { LucideHome, LucidePencil, LucideUser, LayoutDashboard, LucideLogOut, LucideMenu, LucideX } from "lucide-react";
import { Tooltip } from "radix-ui";
import { useAuth } from "@/app/providers/AuthProvider";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import useIsMobile from "@/app/lib/hooks/useIsMobile";

function SiteNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile(); // Check for mobile breakpoint
  const [isExpanded, setIsExpanded] = useState(false);
    const firstMenuItemRef = useRef<HTMLAnchorElement>(null);
    const burgerButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsExpanded((prev) => !prev);
  };

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

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
    <nav
      className={`${styles.siteNav__nav} ${isVisible ? `${styles.visible}` : `${styles.hidden}`} fp`}
      role="menu"
      aria-expanded={isVisible}
      aria-hidden={!isVisible}
    >
      {isMobile && (
        <button 
            ref={burgerButtonRef}
            className={`${styles.siteNav__link} ${styles.icon} fp`}
            onClick={toggleMenu}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Close menu" : "Open menu"}
        >
            {isExpanded ? <LucideX size={16} /> : <LucideMenu size={16} />}
        </button>
      )}

      {!isMobile && (
        <>
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
        </>
      )}
      {!user && (
        <Link className={`${styles.siteNav__link} btn_main`} href="/login" role="menulink">
          <LucideUser size={16} />
          Sign in
        </Link>
      )}
      {user && (
        <div className={`${styles.siteNav__link} btn_main`} role="menuitem">
          <LucideLogOut size={16} className={styles.item__icon} />
          <div onClick={() => handleLogout()} className="h4">
            Log out
          </div>
        </div>
      )}
    </nav>
  );
}

export default SiteNav;
