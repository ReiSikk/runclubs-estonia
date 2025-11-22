"use client";

import { useState, useEffect } from 'react'
import styles from '@/app/login/page.module.css'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

interface LoginWithUsernameProps {
  showToast: (msg: string, type?: "success" | "error") => void;
  showCountdownToast: (msg: string, seconds: number, onComplete?: () => void) => void;
  mapAuthError: (error: unknown) => string;
  setActiveTab?: (tab: string) => void;
}

export default function LoginWithUsername({ showToast, showCountdownToast, mapAuthError, setActiveTab }: LoginWithUsernameProps) {
  const router = useRouter();
  const [data, setData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);;

  try {
    await signInWithEmailAndPassword(auth, data.email, data.password);
    showCountdownToast("Login successful!", 3, () => {
      });
  } catch (error: unknown) {
      const msg = mapAuthError(error);
      showToast(msg, "error");
  }
};

/* Handle Google sign in  */
const handleGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    showCountdownToast("Sign in successful!", 3, () => {
      router.push('/dashboard'); 
    });
  } catch (error: unknown) {
    const msg = mapAuthError(error);
    showToast(msg, "error");
  }
};


  return (
    <div className={styles.loginForm__wrap}>
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
        <div className={`${styles.loginForm__actions} fp-col`}>
          <button type="submit" className="btn_main">
            Sign in
          </button>
          <button
            type="button"
            className="gsi-material-button"
            onClick={handleGoogleSignIn}
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  style={{ display: "block" }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">Continue with Google</span>
            </div>
          </button>
        </div>
      </form>
      <p className={styles.login__text}>Don&apos;t have an account? <span onClick={() => setActiveTab && setActiveTab("tab2")} className={`${styles.login__link} txt-body underline`}>Sign Up</span> </p>
    </div>
  )
}