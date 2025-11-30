"use client";

import { useState } from "react";
import styles from "@/app/login/page.module.css";
import Link from "next/link";
import * as Form from "@radix-ui/react-form";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

interface SignUpFormProps {
  showToast: (msg: string, type?: "success" | "error") => void;
  showCountdownToast: (msg: string, seconds: number, onComplete?: () => void) => void;
  setActiveTab: (tab: string) => void;
  mapAuthError: (error: unknown) => string;
}

export default function SignUpForm({ showToast, showCountdownToast, setActiveTab, mapAuthError }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signUpNewUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (password !== confirmPassword) {
        showToast("Passwords do not match", "error");
        return;
      }
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Optionally update display name
      if (userCredential.user && name) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      // Show success toast with countdown and redirect to login
      showCountdownToast("Sign up successful!", 3, () => {
        setActiveTab("tab1");
      });

    } catch (error: unknown) {
      const msg = mapAuthError(error);
      showToast(msg, "error");
    }
  };

  return (
    <div className={styles.loginForm__wrap}>
      <div className={styles.loginForm__header}>
        <h1 className={`${styles.loginForm__title} h2`}>Register an account</h1>
      </div>
      <Form.Root onSubmit={signUpNewUser} className={`${styles.loginForm} bradius-m`}>
        <Form.Field name="name" className="inputRow">
          <Form.Label className="rcForm__label">First and last name</Form.Label>
          <Form.Control
            className="rcForm__input"
            id="name"
            type="text"
            value={name}
            maxLength={256}
            placeholder="Your name"
            autoComplete="name"
            pattern="^[A-Za-zÀ-ÖØ-öø-ÿ\-']{2,}(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ\-']{2,})+$"
            required
            onChange={(e) => setName(e.target.value)}
          />
          <Form.Message match="patternMismatch" className="input__message">
            Please enter a valid name
          </Form.Message>
        </Form.Field>
        <Form.Field name="email" className="inputRow">
          <Form.Label className="rcForm__label">Email</Form.Label>
          <Form.Control
            className="rcForm__input"
            id="email"
            type="email"
            value={email}
            maxLength={256}
            placeholder="Your email"
            autoComplete="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <Form.Message match="typeMismatch" className="input__message">
            Please enter a valid email address
          </Form.Message>
        </Form.Field>
        <Form.Field name="password" className="inputRow">
          <Form.Label className="rcForm__label" htmlFor="password">
            Password:
          </Form.Label>
          <Form.Control
            className="rcForm__input"
            id="password"
            type="password"
            placeholder="Enter a password"
            autoComplete="current-password"
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Form.Message match="patternMismatch" className="input__message">
            Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters
          </Form.Message>
        </Form.Field>
        <Form.Field className="inputRow" name="confirm-password">
          <Form.Label className="rcForm__label" htmlFor="confirm-password">
            Confirm Password:
          </Form.Label>
          <input
            className="rcForm__input"
            id="confirm-password"
            type="password"
            placeholder="Confirm your password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Form.Message match="valueMissing" className="input__message">
            Please repeat your password
          </Form.Message>
        </Form.Field>
        <Form.Submit className="btn_main">Sign Up</Form.Submit>
      </Form.Root>
      <p className={styles.login__text}>
        Already have an account?{" "}
        <Link href="/login" className={`${styles.login__link} underline`}>
          Sign In
        </Link>{" "}
      </p>
    </div>
  );
}
