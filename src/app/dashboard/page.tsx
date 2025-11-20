"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import Image from "next/image";
import RunClubCard from "../components/Dashboard/RunClubCard";
import getUserRunClubs from "../lib/hooks/useMyRunClubs";

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
    <main className={`${styles.dashboard} container`}>
      <aside className={`${styles.dashboard__side} fp-col`}>
        <div className={`${styles.dashboard__profile} fp-col`}>
          <div className={styles.avatar}>
            {user.photoURL ? (
              <Image src={user.photoURL} alt={user.displayName || "User avatar"} width={72} height={72} />
            ) : (
              <div className={styles.placeholderAvatar}>{user?.displayName?.[0]}</div>
            )}
          </div>
          <h1 className="h4">{user.displayName}</h1>
        </div>
        <div className={styles.info}>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}
          </p>
          {user.phoneNumber && (
            <p>
              <strong>Phone Number:</strong> {user.phoneNumber || "—"}
            </p>
          )}
        </div>
      </aside>
      <div className={styles.dashboard__main}>
        <h2 className="h3">Welcome to your dashboard, {user.displayName}!</h2>
        <p>Here you can manage your account and view your activities.</p>
        <section className={styles.myClubs}>
          <h2 className={`${styles.myClubs__title}`}>Your run clubs</h2>
          <p className="">2 clubs you organize</p>
          <div className={`${styles.myClubs__list} list-grid list-grid--2`}>
            {isLoading && <p>Loading your clubs...</p>}
            {isError && <p>Error loading your clubs. Please try again later.</p>}
            {clubs.length === 0 && !isLoading && <p>You are not organizing any clubs yet.</p>}
            {clubs.map((club) => (
              <RunClubCard key={club.id} {...club} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default DashboardPage;
