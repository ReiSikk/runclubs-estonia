"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import RunClubCard from "../components/Dashboard/RunClubCard";
import getUserRunClubs from "../lib/hooks/useMyRunClubs";
import { formatMonthYear } from "../lib/utils/convertTime";


function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser as User);
    });
    return () => unsubscribe();
  }, []);

  // Find users clubs
  const { data: clubs = [], isLoading, isError } = getUserRunClubs(user?.uid);

  if (!user) {
    return (
      <main className={`${styles.dashboard} container`}>
        <div>Loading user data...</div>
      </main>
    );
  }

  return (
    <div className={`${styles.page} container`}>
      <div className={`${styles.page__header}`}>
        <h1 className="h1">Welcome to your dashboard, {user.displayName?.split(" ")[0] || ""}! 👋</h1>
        <p>Here you can manage your account and view your clubs and activities. 
          <br/>Keep building the running community of Estonia!
        </p>
      </div>
      <main className={`${styles.dashboard} fp-col`}>
          <section className={styles.dashboardStats}>
            <ul className={`${styles.dashboardStats__list} list-grid list-grid--3`}>
              <li className={`${styles.dashboardStats__item} ${styles.card_dashboard} fp-col`}>
                <div className={`${styles.dashboardStats__initials} fp`}>
                  <span className="h3">
                    {user.displayName?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </span>
                </div>
                  <div className={`${styles.nameMember} fp`}>
                    <h2 className={`${styles.name} h3`}>{user.displayName}</h2>
                    {user.metadata.creationTime && (
                      <div className={`${styles.since} fp-col`}>
                        <span className="txt-small">Member since</span>
                        <span className="txt-label">
                          {formatMonthYear(user.metadata.creationTime)}
                        </span>
                      </div>
                    )}
                  </div>
              </li>
              <li className={`${styles.dashboardStats__item} ${styles.card_dashboard} ${styles.accent} ${styles.simple}`}>
                <div className={`${styles.inner} fp-col`}>
                  <span className={`${styles.dashboardStats__label} txt-label`}>Total members</span>
                  <h3 className="h1">79</h3>{/* //TODO: Remove or add dynamic stats */}
                </div>
              </li>
              <li className={`${styles.dashboardStats__item} ${styles.card_dashboard} ${styles.simple}`}>
                <div className={`${styles.inner} fp-col`}>
                  <span className={`${styles.dashboardStats__label} txt-label`}>Active clubs</span>
                  <h4 className="h1">{clubs.length}</h4>
                </div>
              </li>
            </ul>
            <div className={`${styles.clubsNevents} list-grid`}>
              <div className={`${styles.card_dashboard}`}>
                <div className={`${styles.titlecount} fp`}>
                  <h5 className="h3">Your run clubs</h5>
                  <div className="txt-label card-label--small">{clubs.length}</div>
                </div>
                <ul className="fp-col">
                  {isLoading && <p>Loading your clubs...</p>}
                  {isError && <p>Error loading your clubs. Please try again later.</p>}
                  {clubs.length === 0 && !isLoading && <p>You are not organizing any clubs yet.</p>}
                  {clubs.map((club) => (
                    <RunClubCard key={club.id} {...club} />
                  ))}

                </ul>
              </div>
              <div className={`${styles.card_dashboard} ${styles.createEvent} ${styles.dark} fp-col`}>
                <div className={`${styles.createEvent__title}`}>
                  <h5 className={`${styles.createEvent__title} h3`}>Create an event</h5>
                  <p className="txt-body">Schedule a new run for one of your clubs.</p>
                </div>
                <button className={`${styles.createEvent__btn} btn_main`}>Create Event</button>
              </div>
            </div>
          </section>
      </main>
    </div>
  );
}

export default DashboardPage;
