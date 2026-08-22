"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Citizen, Role } from "@/lib/types";

const DEMO_CITIZENS = ["CIT-10293", "CIT-10294", "CIT-10295"];

export default function LoginPage() {
  const [role, setRole] = useState<Role>("citizen");
  const [citizenId, setCitizenId] = useState("CIT-10293");
  const [department, setDepartment] = useState("Dept. of Education");
  const [citizens, setCitizens] = useState<Record<string, Citizen>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    Promise.all(DEMO_CITIZENS.map((id) => api.get<Citizen>(`/api/citizens/${id}`).catch(() => null))).then((results) => {
      // citizens endpoint requires auth in the real backend; if it fails (not yet logged in),
      // fall back to display-only labels so the picker still renders.
    });
  }, []);

  async function handleLogin() {
    setBusy(true);
    setError("");
    try {
      const user = await login(role, { citizenId, department });
      if (user.role === "citizen") router.push("/citizen/dashboard");
      else if (user.role === "official") router.push("/official/dashboard");
      else router.push("/admin/hub");
    } catch (e: any) {
      setError(e.message || "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  const citizenLabels: Record<string, string> = {
    "CIT-10293": "Rahul Kumar",
    "CIT-10294": "Priya Sharma",
    "CIT-10295": "Aman Verma",
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Brand size="text-xl" light />
          </Link>
          <p className="text-slate-400 text-sm mt-2">Sign in to the GovSync prototype · demo data only</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 tracking-wide mb-2">CHOOSE A ROLE</p>
            <div className="grid grid-cols-3 gap-2">
              {(["citizen", "official", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`border rounded-lg py-2.5 text-sm font-medium capitalize ${
                    role === r ? "border-navy-900 bg-navy-900 text-white" : "border-slate-200 text-slate-600"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {role === "citizen" && (
            <div>
              <p className="text-xs font-semibold text-slate-500 tracking-wide mb-2">SELECT DEMO CITIZEN</p>
              <div className="space-y-2 mb-4">
                {DEMO_CITIZENS.map((id) => (
                  <label
                    key={id}
                    className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer hover:border-teal-400 ${
                      citizenId === id ? "border-teal-500 bg-teal-50" : "border-slate-200"
                    }`}
                  >
                    <input type="radio" name="cit" checked={citizenId === id} onChange={() => setCitizenId(id)} className="accent-teal-600" />
                    <div className="w-8 h-8 rounded-full bg-navy-900 text-white text-xs font-semibold flex items-center justify-center">
                      {citizenLabels[id].split(" ").map((p) => p[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{citizenLabels[id]}</p>
                      <p className="text-xs text-slate-400 font-mono-gs">{id}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {role === "official" && (
            <div>
              <p className="text-xs font-semibold text-slate-500 tracking-wide mb-2">DEPARTMENT</p>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full mb-2">
                <option>Dept. of Education</option>
                <option>Revenue Department</option>
                <option>Labour Department</option>
              </select>
            </div>
          )}

          {role === "admin" && <p className="text-sm text-slate-500">Signs in as the platform&apos;s System Administrator with full access to the Integration Hub, monitoring, and configuration tools.</p>}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button onClick={handleLogin} disabled={busy} className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm">
            {busy ? "Signing in…" : `Sign in as ${role[0].toUpperCase()}${role.slice(1)}`}
          </button>
        </div>
        <p className="text-center text-slate-500 text-xs mt-6">Prototype only — no real credentials are used.</p>
      </div>
    </div>
  );
}
