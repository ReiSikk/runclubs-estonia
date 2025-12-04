"use client"

import React from 'react'
import RunClubRegistrationForm from '../components/Forms/RunClubRegistrationForm'
import styles from './page.module.css'
import NavBar from '../components/Navbar/NavBar'
import { useAuth } from '../providers/AuthProvider'
import LoaderSpinner from '../components/Loader/LoaderSpinner'
import Link from 'next/link'

function SubmitRunClubPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={`${styles.page} ${styles.empty} page--loading container`}>
        <div className="loader fp">
          <LoaderSpinner size={12} />
          <h1 className="h4">Fetching your user profile</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
       <div className={`${styles.page} ${styles.empty} page--loading mt-0 container`}>
        <div className="loader fp-col">
          <h1 className="h4">Please sign in or create an account to submit a run club.</h1>
          <Link href="/login" className="btn_main accent">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.page} page-submit-runclub container`} id='page-top'>
        <NavBar />
        <RunClubRegistrationForm mode="create"/>
    </div>
  )
}

export default SubmitRunClubPage