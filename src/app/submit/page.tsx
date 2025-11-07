import React from 'react'
import RunClubRegistrationForm from '../components/SubmitForm/RunClubRegistrationForm'
import styles from './page.module.css'

function SubmitRunClubPage() {
  return (
    <div className={`${styles.page} page-submit-runclub container`}>
        <RunClubRegistrationForm />
    </div>
  )
}

export default SubmitRunClubPage