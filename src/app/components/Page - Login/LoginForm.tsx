"use client";

import { useState } from 'react'
import styles from '@/app/login/page.module.css'
import Link from 'next/link'
import FormToast from '../Toast/Toast'

interface LoginWithUsernameProps {
  updateLoginOption: (option: string) => void;
}

export default function LoginWithUsername({ updateLoginOption}: LoginWithUsernameProps) {

  const [data, setData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false )

  // Toast State
  const [toastMessage, setToastMessage] = useState('')
    // Feedback toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Submitting form with data:', data);
  }


  return (
    <div className={styles.loginForm__wrap}>
  <FormToast
          message={
            success && countdown !== null && countdown > 0
              ? ` Redirecting in (${countdown})...`
              : toastMessage
          }
          type={success ? "success" : "error"}
          open={success || Boolean(error)}
          onOpenChange={setToastOpen}
          aria-live="polite"
        />
      <div className={styles.loginForm__header}>
        <h1 className={`${styles.loginForm__title} h2`}>Sign in to your account</h1>
      </div>
      <form onSubmit={handleSubmit} className={`${styles.loginForm} bradius-m`}>
        <div className="inputRow">
          <label className="rcForm__label h5" htmlFor="email">Email</label>
          <input
            className="rcForm__input"
            id="email"
            type="email" 
            value={data?.email} 
            placeholder='Your email'
            autoComplete='email'
            onChange={(e) => setData({...data, email: e.target.value})} 
          />
        </div>
        <div className="inputRow">
          <label className="rcForm__label h5" htmlFor="password">Password</label>
          <input
            className="rcForm__input"
            id="password"
            type="password" 
            value={data?.password} 
            placeholder='Your password'
            onChange={(e) => setData({...data, password: e.target.value})} 
          />
        </div>
        {error && <p className="input__error">{`${error} !`}</p>}
        <button type="submit" className="btn_main">
          Sign in
        </button>
      </form>
      <p className={styles.login__text}>Don&apos;t have an account? <Link href="/login?id=signup" className={styles.login__link}>Sign Up</Link> </p>
    </div>
  )
}