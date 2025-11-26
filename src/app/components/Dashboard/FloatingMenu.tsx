import React, { useState } from "react";
import styles from "./FloatingMenu.module.css";
import Link from "next/link";
import {
  LucideLayoutGrid,
  LucideHome,
  LucideSend,
  LucideLogOut,
  LucideMenu,
  LucideX,
} from "lucide-react";

interface FloatingMenuProps {
  handleLogOut: () => void;
}

export default function FloatingMenu({ handleLogOut }: FloatingMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMenu = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={`${styles.floatingMenu} ${isExpanded ? styles.expanded : ""} fp-col`}>
    <ul className={styles.menuItems + " fp-col"}>
        <li className={`${styles.item} fp`}>
            <LucideLayoutGrid size={20} className={styles.item__icon} />
            <Link href="/dashboard" className="h4">Dashboard</Link>
        </li>
        <li className={`${styles.item} fp`}>
            <LucideHome size={20} className={styles.item__icon} />
            <Link href="/" className="h4">Home</Link>
        </li>
        <li className={`${styles.item} fp`}>
            <LucideSend size={20} className={styles.item__icon} />
            <Link href="/submit" className="h4">Register club</Link>
        </li>
        <li className={`${styles.item} fp`} onClick={handleLogOut}>
            <LucideLogOut size={20} className={styles.item__icon} />
            <div onClick={handleLogOut} className="h4">
                Log out
            </div>
        </li>
    </ul>
    <div className={styles.actions + " fp"}>
        <span className="h3">Menu</span>
        <button
            className={styles.burgerMenu}
            onClick={toggleMenu}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Close menu" : "Open menu"}
        >
        {isExpanded ? (
            <LucideX size={24} />
        ) : (
            <LucideMenu size={24} />
        )}
        </button>
    </div>
    </div>
  );
}