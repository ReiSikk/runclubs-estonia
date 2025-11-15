"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import LoginWithUsername from "@/app/components/Page - Login/LoginForm";
import SignUpForm from "@/app/components/Page - Login/SignUpForm";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = false; //TODO:: Replace with actual auth state!!!
  const id = searchParams.get("id");
  const [activeTab, setActiveTab] = useState(id === "signup" ? "tab2" : "tab1");

  const [loginOption, setLoginOption] = useState("userAndPass");

  const updateLoginOption = (option: string) => {
    setLoginOption(option);
  };

  // if user is logged in redirect to home page
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [router, isLoggedIn]);

  return (
    <main className={`${styles.loginPage__main} container`}>
      <div className={`${styles.loginPage__wrapper} bradius-m`}>
        <Tabs.Root className={styles.tabs__root} defaultValue="tab1" value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List
            className={`${styles.tabs__list} ${activeTab === "tab1" ? "slide-left" : `${styles.slide_right}`}`}
            aria-label="Manage your account"
          >
            <Tabs.Trigger className={styles.tabs__trigger} value="tab1">
              Sign In
            </Tabs.Trigger>
            <Tabs.Trigger className={styles.tabs__trigger} value="tab2">
              Sign Up
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className={styles.tabs__content} value="tab1">
            {loginOption === "userAndPass" && <LoginWithUsername updateLoginOption={updateLoginOption} />}
          </Tabs.Content>
          <Tabs.Content className={styles.tabs__content} value="tab2">
            <SignUpForm />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </main>
  );
}
