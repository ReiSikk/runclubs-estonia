"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/app/lib/firebase/firebase";
import { initializeAppCheckClient } from "@/app/lib/firebase/appCheck";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize App Check once the DOM is ready on the client, before any
    // auth-protected requests are made. Deferring this from module evaluation
    // prevents reCAPTCHA from injecting nodes during React hydration.
    initializeAppCheckClient();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser as User | null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

    // redirect when user is not authenticated AND route is protected
  useEffect(() => {
    if (loading) return;


    const protectedPrefixes = [
      "/dashboard",
    ];

    const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));

    if (!user && isProtected && pathname !== "/login") {
      router.replace("/login");
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}