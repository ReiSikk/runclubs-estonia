"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/login/page.module.css";
import Link from "next/link";
import * as Form from "@radix-ui/react-form";

export default function SignUpForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [userCreated, setUserCreated] = useState(false);

  //User creation logic
  const signUpNewUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting form with data:", { name, email, password, confirmPassword });

    try {
      // Check if passwords match
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      //TODO sign in here with firebase!!!

      setUserCreated(true),
        setTimeout(() => {
          router.push("/home");
          setUserCreated(false);
        }, 2000);
    } catch (error: unknown) {
      console.error("Form submission error:", error);
      //TODO: SET ERROR MESSAGE TO DISPLAY TO USER into state
    }
  };

  return (
    <div className={styles.loginForm__wrap}>
      <div className={styles.loginForm__header}>
        <h1 className={styles.loginForm__title}>Register an account</h1>
      </div>
      {userCreated && (
        <div className="signup__success">
          <p>You have successfully signed up!</p>
          <span>Redirecting to home page...</span>
        </div>
      )}
      <Form.Root onSubmit={signUpNewUser} className={styles.loginForm}>
        <Form.Field name="name" className="form__row">
          <Form.Label className="form__label">First and last name</Form.Label>
          <Form.Control
            className="form__input"
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
          {/* {error && <p className="input__error">{`${error.message}!`}</p>} */}
        </Form.Field>
        <Form.Field name="email" className="form__row">
          <Form.Label className="form__label">Email</Form.Label>
          <Form.Control
            className="form__input"
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
          {/* {error && <p className="input__error">{`${error.message}!`}</p>} */}
        </Form.Field>
        <Form.Field name="password" className="form__row">
          <Form.Label className="form__label" htmlFor="password">
            Password:
          </Form.Label>
          <Form.Control
            className="form__input"
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
        <Form.Field className="form__row" name="confirm-password">
          <Form.Label className="form__label" htmlFor="confirm-password">
            Confirm Password:
          </Form.Label>
          <input
            className="form__input"
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
        {error && <p className="input__error">{`${error}!`}</p>}
        <Form.Submit className={styles.loginBtn}>Sign Up</Form.Submit>
        <p className={styles.login__text}>
          Already have an account?{" "}
          <Link href="/login" className={styles.login__link}>
            Sign In
          </Link>{" "}
        </p>
      </Form.Root>
    </div>
  );
}
