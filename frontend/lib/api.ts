"use client";

/**
 * Thin fetch wrapper around the GovSync FastAPI backend.
 * Attaches the JWT from localStorage (set at login) to every request.
 *
 * NOTE ON STORAGE: this is a real Next.js app that you run yourself with
 * `npm run dev`, not a sandboxed preview — using localStorage for the demo
 * JWT here is the standard, simple pattern for a prototype. For a
 * production deployment you'd likely move to httpOnly session cookies.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("govsync_token");
}

export function setToken(token: string) {
  localStorage.setItem("govsync_token", token);
}

export function clearToken() {
  localStorage.removeItem("govsync_token");
  localStorage.removeItem("govsync_user");
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* no JSON body */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T,>(path: string) => request<T>(path, { method: "GET" }),
  post: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
};

export { API_URL };
