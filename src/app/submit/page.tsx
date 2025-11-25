"use client"

import React from 'react'
import RunClubRegistrationForm from '../components/Forms/RunClubRegistrationForm'
import styles from './page.module.css'
import NavBar from '../components/Navbar/NavBar'
import { useAuth } from '../providers/AuthProvider'

function SubmitRunClubPage() {
  const { user, loading } = useAuth();

  if (!user || loading) {
     return (
        <div className={`${styles.page} page-submit-runclub loading container`} id='page-top'>
          <NavBar />
          <div className={styles.page__main + " page--loading"}>
            <main className={`container`}>
              <h1 className="h4">Checking log in status and getting things ready...</h1>
            </main>
          </div>
        </div>
      )
  }


  return (
    <div className={`${styles.page} page-submit-runclub container`} id='page-top'>
        <NavBar />
        <RunClubRegistrationForm />
    </div>
  )
}

export default SubmitRunClubPage