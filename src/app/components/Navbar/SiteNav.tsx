import React from 'react'
import Link from "next/link";
import styles from './SiteNav.module.css'
import { LucideHome, LucidePencil, LucideUser, LayoutDashboard } from 'lucide-react'
import { Tooltip } from "radix-ui";

function SiteNav() {
  return (
    <div className={styles.siteNav}>
        <nav className={`${styles.siteNav__nav} fp`}>
            <Link className={`${styles.siteNav__link} btn_main`} href="/">
                <LucideHome size={16} />
                Home
            </Link>
            <Tooltip.Provider delayDuration={500}>
			    <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <Link className={`${styles.siteNav__link} ${styles.icon} fp`} href="/submit">
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
                         <Link className={`${styles.siteNav__link} ${styles.icon} fp`} href="/dashboard">
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
            <Link className={`${styles.siteNav__link} btn_main`} href="/dashboard/run-club-events">
                <LucideUser size={16} />
                Sign in
            </Link>
        </nav>
    </div>
  )
}

export default SiteNav