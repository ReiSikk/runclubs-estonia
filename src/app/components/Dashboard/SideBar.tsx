import React from "react";
import FloatingMenu from "./FloatingMenu"; // Import the new FloatingMenu component
import styles from "./SideBar.module.css";
import Link from "next/link";
import {
  LucideLayoutDashboard,
  LucideHome,
  LucideSend,
  LucideLogOut,
  LucidePlus,
} from "lucide-react";

interface SideBarProps {
  handleLogOut: () => void;
  isMobile: boolean;
  onEventClicked?: () => void;
}

function SideBar({ handleLogOut, isMobile, onEventClicked }: SideBarProps) {

  if (isMobile) {
    return <FloatingMenu handleLogOut={handleLogOut} onEventClicked={onEventClicked} />;
  }

  return (
    <nav className={styles.sideBar +" fp-col"}>
        <Link href="/dashboard" className={`${styles.item}  h4 fp`}>
        <LucideLayoutDashboard size={20} className={styles.item__icon} />
            Dashboard
        </Link>
        <Link href="/" className={`${styles.item}  h4 fp`}>
        <LucideHome size={20} className={styles.item__icon} />
            Home
        </Link>
        <Link href="/submit" className={`${styles.item}  h4 fp`}>
        <LucideSend size={20} className={styles.item__icon} />
            Register club
        </Link>
        <div className={`${styles.item} ${styles.rotate}  h4 fp`} onClick={onEventClicked}>
        <LucidePlus size={20} className={styles.item__icon} />
            Create new event
        </div>
        <div className={`${styles.item} fp`}>
        <LucideLogOut size={20} className={styles.item__icon} />
        <div onClick={handleLogOut} className="h4">
            Log out
        </div>
        </div>
    </nav>
  );
}

export default SideBar;