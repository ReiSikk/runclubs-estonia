import React, { useState, useEffect } from "react";
import FloatingMenu from "./FloatingMenu"; // Import the new FloatingMenu component
import styles from "./SideBar.module.css";
import Link from "next/link";
import {
  LucideLayoutGrid,
  LucideHome,
  LucideSend,
  LucideLogOut,
} from "lucide-react";

interface SideBarProps {
  handleLogOut: () => void;
}

function SideBar({ handleLogOut }: SideBarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Mobile breakpoint
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isMobile) {
    // Render FloatingMenu for mobile view
    return <FloatingMenu handleLogOut={handleLogOut} />;
  }

  return (
    <div className={styles.sideBar}>
      <nav className={styles.sideBar__menu}>
        <ul className={`${styles.sideBar__list} fp-col`}>
          <li className={`${styles.item} fp`}>
            <LucideLayoutGrid size={20} className={styles.item__icon} />
            <Link href="/dashboard" className="h4">
              Dashboard
            </Link>
          </li>
          <li className={`${styles.item} fp`}>
            <LucideHome size={20} className={styles.item__icon} />
            <Link href="/" className="h4">
              Home
            </Link>
          </li>
          <li className={`${styles.item} fp`}>
            <LucideSend size={20} className={styles.item__icon} />
            <Link href="/submit" className="h4">
              Register club
            </Link>
          </li>
          <li className={`${styles.item} fp`}>
            <LucideLogOut size={20} className={styles.item__icon} />
            <div onClick={handleLogOut} className="h4">
              Log out
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default SideBar;