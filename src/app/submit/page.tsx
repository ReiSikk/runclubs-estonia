"use client"

import React from 'react'
import RunClubRegistrationForm from '../components/Forms/RunClubRegistrationForm'
import styles from './page.module.css'
import NavBar from '../components/Navbar/NavBar'

function SubmitRunClubPage() {

  return (
    <div className={`${styles.page} page-submit-runclub container`} id='page-top'>
        <NavBar />
        <RunClubRegistrationForm mode="create"/>
    </div>
  )
}

export default SubmitRunClubPage