import React, { useState, useRef, useEffect } from "react";
import styles from "./FloatingMenu.module.css";
import Link from "next/link";
import { LucideLayoutGrid, LucideHome, LucideSend, LucideLogOut, LucideMenu, LucideX } from "lucide-react";

interface FloatingMenuProps {
  handleLogOut: () => void;
}

export default function FloatingMenu({ handleLogOut }: FloatingMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);
  const burgerButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsExpanded((prev) => !prev);
  };

  // Focus management for accessibility
  useEffect(() => {
    if (isExpanded && firstMenuItemRef.current) {
      firstMenuItemRef.current.focus();
    } else if (!isExpanded && burgerButtonRef.current) {
      burgerButtonRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div className={styles.layout}>
        <div className={`${styles.floatingMenu} ${isExpanded ? styles.expanded : ""} fp-col`}>
        <nav className={styles.menuItems + " fp-col"} role="menu" aria-hidden={!isExpanded}>
            <Link href="/dashboard" className={`${styles.item} h4 fp`} aria-hidden={!isExpanded} ref={firstMenuItemRef} tabIndex={isExpanded ? 0 : -1}>
                <LucideLayoutGrid size={20} className={styles.item__icon} />
                Dashboard
            </Link>
            <Link href="/" className={`${styles.item} h4 fp`} tabIndex={isExpanded ? 0 : -1} role="menuitem">
                <LucideHome size={20} className={styles.item__icon} />
                    Home
            </Link>
            <Link href="/submit" className={`${styles.item} h4 fp`} tabIndex={isExpanded ? 0 : -1} role="menuitem">
                <LucideSend size={20} className={styles.item__icon} />
                    Register club
            </Link>
            <div className={`${styles.item} fp`} onClick={handleLogOut} tabIndex={isExpanded ? 0 : -1} role="menuitem">
                <LucideLogOut size={20} className={styles.item__icon} />
                <div onClick={handleLogOut} className="h4">
                    Log out
                </div>
            </div>
        </nav>
        <div className={styles.actions + " fp"}>
            <span className="h3">Menu</span>
            <button
                ref={burgerButtonRef}
                className={styles.burgerMenu}
                onClick={toggleMenu}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Close menu" : "Open menu"}
            >
            {isExpanded ? <LucideX size={24} /> : <LucideMenu size={24} />}
            </button>
        </div>
        </div>
    </div>
  );
}
