"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@/lib/types";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getMeRequest,
} from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean; // true while we check the session on first load
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Wraps the whole app and holds the logged-in user in React state.
 * On first mount it calls /api/auth/me to restore the session (the JWT lives in
 * an httpOnly cookie, so a page refresh keeps you logged in).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMeRequest()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null)) // 401 = not logged in, which is fine
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await registerRequest(name, email, password);
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook so components can read auth state with one line. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
}
