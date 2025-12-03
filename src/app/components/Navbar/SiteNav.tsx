"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./SiteNav.module.css";
import {
  LucideHome,
  LucidePencil,
  LucideUser,
  LayoutDashboard,
  LucideLogOut,
  LucideMenu,
  LucideX,
  LucideSend,
  LucideMailMinus,
  LucideMailCheck,
  LucideLayoutDashboard,
} from "lucide-react";
import { Tooltip } from "radix-ui";
import { useAuth } from "@/app/providers/AuthProvider";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/app/lib/hooks/useIsMobile";

function SiteNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user } = useAuth();
  const router = useRouter();
  // Check for mobile breakpoint and keep state of menu
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);
  const burgerButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsExpanded((prev) => !prev);
  };

    useEffect(() => {
    if (isExpanded) {
      document.documentElement.style.overflowY = "hidden";
    } else {
      document.documentElement.style.overflowY = "";
    }
  }, [isExpanded]);

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
    <>
      <div className={`${styles.overlay} ${isExpanded ? styles.visible : ""}`}>
        <div className={styles.siteNavMobile}>
          <div className={styles.siteNavMobile__wrap + " fp-col"}>
            {user && (
              <div className={`${styles.userCard} fp`}>
                <div className={`${styles.userCard__avatar} fp`}>
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt={`${user.displayName}'s avatar`} className={styles.avatar} width={48} height={48} />
                  ) : (
                    <span className="h3">
                      {user.displayName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={`${styles.userCard__info} fp-col`}>
                  <h4 className="h4">{user.displayName}</h4>
                  {user.emailVerified ? (
                    <div className={`${styles.mailStatus} ${styles.verified} txt-label fp`}>
                      <LucideMailCheck size={16} /> Email verified
                    </div>
                  ) : (
                    <div className={`${styles.mailStatus} ${styles.unverified} txt-label fp`}>
                      <LucideMailMinus size={16} /> Email not verified
                    </div>
                  )}
                </div>
              </div>
            )}
            <nav
              className={`${styles.siteNavMobile__menu} ${
                isExpanded ? `${styles.visible}` : `${styles.hidden}`
              } list-grid`}
              role="menu"
              aria-hidden={!isVisible}
            >
              <Link
                className={`${styles.siteNav__link} ${styles.mobile_xl} btn_main fp-col`}
                href="/submit"
                role="menulink"
                onClick={toggleMenu}
              >
                <span>Submit a new run club</span>
                <div className={styles.icon + " fp"}>
                  <LucideSend size={16} />
                </div>
              </Link>
              <Link
                className={`${styles.siteNav__link} ${styles.mobile_xl} btn_main fp-col`}
                href="/dashboard"
                role="menulink"
                onClick={toggleMenu}
              >
                <span>Manage my clubs & events</span>
                <div className={styles.icon + " fp"}>
                  <LayoutDashboard size={16} />
                </div>
              </Link>
              <Link
                ref={firstMenuItemRef}
                className={`${styles.siteNav__link} ${styles.mobile} btn_main`}
                href="/"
                role="menulink"
                onClick={toggleMenu}
              >
                <LucideHome size={16} />
                Home
              </Link>
              {!user && (
                <Link
                  className={`${styles.siteNav__link} ${styles.mobile} btn_main`}
                  href="/login"
                  role="menulink"
                  onClick={toggleMenu}
                >
                  <LucideUser size={16} />
                  Sign in
                </Link>
              )}
              {user && (
                <div
                  className={`${styles.siteNav__link} ${styles.mobile} btn_main`}
                  role="menuitem"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                >
                  <LucideLogOut size={16} className={styles.item__icon} />
                  <div className="h4">Log out</div>
                </div>
              )}
            </nav>
            <button
              className={`${styles.siteNav__link} ${styles.icon} ${styles.toggle} fp`}
              onClick={toggleMenu}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Close menu" : "Open menu"}
            >
              <span className="h4">Close</span>
              <LucideX size={20} />
            </button>
          </div>
        </div>
      </div>
      <nav
        className={`${styles.siteNav__nav} ${isVisible ? `${styles.visible}` : `${styles.hidden}`} fp`}
        role="menu"
        aria-hidden={!isVisible}
      >
        {(isMobile || isExpanded) && (
          <>
            <button
              ref={burgerButtonRef}
              className={`${styles.siteNav__link} ${styles.icon} ${styles.toggle} fp`}
              onClick={toggleMenu}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Close menu" : "Open menu"}
            >
              {isExpanded ? <LucideX size={16} /> : <LucideMenu size={16} />}
            </button>
            {!user ? (
              <Link className={`${styles.siteNav__link} btn_main`} href="/login" role="menulink">
                <LucideUser size={16} />
                Sign in
              </Link>
            ) : (
              <Link href="/dashboard" className={`${styles.siteNav__link} btn_main`} role="menuitem">
                <LucideLayoutDashboard size={16} className={styles.item__icon} />
                My Dashboard
              </Link>
            )}
          </>
        )}

        {!isMobile && !isExpanded && (
          <>
            <Link className={`${styles.siteNav__link} btn_main`} href="/" role="menulink">
              <LucideHome size={16} />
              Home
            </Link>
            {!user ? (
              <Link className={`${styles.siteNav__link} btn_main`} href="/login" role="menulink">
                <LucideUser size={16} />
                Sign in
              </Link>
            ) : (
              <Link href="/dashboard" className={`${styles.siteNav__link} btn_main`} role="menuitem">
                <LucideLayoutDashboard size={16} className={styles.item__icon} />
                My Dashboard
              </Link>
            )}
            <Tooltip.Provider delayDuration={0}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link className={`${styles.siteNav__link} ${styles.icon} fp`} href="/submit" role="menulink">
                    <LucidePencil size={19} />
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
            {
              user && (
                <Tooltip.Provider delayDuration={0}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className={`${styles.siteNav__link} ${styles.icon} fp`} onClick={handleLogout} role="menuitem">
                        <LucideLogOut size={19} />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className={styles.Content} sideOffset={5}>
                        Log out
                        <Tooltip.Arrow className={styles.Arrow} />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )
            }
          </>
        )}
      </nav>
    </>
  );
}

export default SiteNav;
