"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, setToken, clearToken, getToken } from "./api";
import type { User, Role } from "./types";

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (role: Role, opts?: { citizenId?: string; department?: string }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const stored = typeof window !== "undefined" ? localStorage.getItem("govsync_user") : null;
    if (token && stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  async function login(role: Role, opts?: { citizenId?: string; department?: string }) {
    const payload: Record<string, string> = { role };
    if (opts?.citizenId) payload.citizen_id = opts.citizenId;
    if (opts?.department) payload.department = opts.department;

    const res = await api.post<LoginResponse>("/api/auth/login", payload);
    setToken(res.access_token);
    localStorage.setItem("govsync_user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }

  function logout() {
    clearToken();
    setUser(null);
    router.push("/");
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
