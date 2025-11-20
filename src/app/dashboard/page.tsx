"use client";

import React, { useState, useEffect} from 'react'
import styles from './page.module.css'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import Image from 'next/image';

interface FirebaseUser {
    displayName: string;
    email: string;
    emailVerified: boolean;
    phoneNumber: string | null;
    photoURL: string | null;
}

function DashboardPage() {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    console.log("Rendering DashboardPage with user:", user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser as FirebaseUser);
    });
    return () => unsubscribe();
  }, []);

    if (!user) {
        return (
            <main className={`${styles.dashboard} container`}>
                <div>Loading user data...</div>
            </main>
        )
    }

  return (
    <main className={`${styles.dashboard} container`}>
        <aside className={`${styles.dashboard__side} fp-col`}>
            <div className={`${styles.dashboard__profile} fp-col`}>
                <div className={styles.avatar}>
                    {user.photoURL ? (
                    <Image src={user.photoURL} alt={user.displayName} width={72} height={72} />
                    ) : (
                    <div className={styles.placeholderAvatar}>
                        {user.displayName[0]}
                    </div>
                    )}
                </div>
                <h1 className='h4'>{user.displayName}</h1>
            </div>
                <div className={styles.info}>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}
          </p>
          {user.phoneNumber &&
            <p>
              <strong>Phone Number:</strong> {user.phoneNumber || "—"}
            </p>
          }
        </div>
        </aside>
      <div className={styles.dashboard__main}>
        <h2 className='h3'>Welcome to your dashboard, {user.displayName}!</h2>
        <p>Here you can manage your account and view your activities.</p>
      </div>
    </main>
  )
}

export default DashboardPage