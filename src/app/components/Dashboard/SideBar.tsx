import React from "react";
import FloatingMenu from "./FloatingMenu"; // Import the new FloatingMenu component
import styles from "./SideBar.module.css";
import Link from "next/link";
import {
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
    <aside className={styles.sideBar}>
      <nav className={`${styles.sideBar__inner} fp-col`}>
        <div className={`${styles.links} fp-col`}>
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
        </div>
          <div className={`${styles.item} ${styles.logout} fp`} onClick={handleLogOut}>
          <LucideLogOut size={20} className={styles.item__icon} />
          <div className="h4">
              Log out
          </div>
          </div>
      </nav>
    </aside>
  );
}

export default SideBar;