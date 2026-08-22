"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Brand } from "@/components/ui";
import { IntegrationFlowRunner } from "@/components/integration-flow";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Service } from "@/lib/types";

export default function DemoPage() {
  const [started, setStarted] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const { user, login } = useAuth();

  useEffect(() => {
    api.get<Service>("/api/services/scholarship").then(setService).catch(() => {});
  }, []);

  async function handleStart() {
    if (!user || user.role !== "citizen") {
      await login("citizen", { citizenId: "CIT-10293" });
    }
    setStarted(true);
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Brand />
          </Link>
          <Link href="/login" className="text-sm font-semibold text-navy-900">
            Sign in →
          </Link>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <p className="font-mono-gs text-xs tracking-widest text-teal-600 mb-3">LIVE SIMULATION</p>
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-3">Interoperability Demo: Student Scholarship</h1>
        <p className="text-slate-500 mb-8 max-w-2xl">
          This runs the full GovSync flow for demo citizen <strong>Rahul Kumar (CIT-10293)</strong>: consent, identity verification, education and income
          checks via the Integration Hub, document retrieval, eligibility calculation, and application submission — hitting the real FastAPI backend and
          mock government APIs, not a simulated UI.
        </p>
        {!started && (
          <button onClick={handleStart} disabled={!service} className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold rounded-lg px-6 py-3.5 text-sm mb-8">
            ▶ Run Interoperability Demo
          </button>
        )}
        {started && service && <IntegrationFlowRunner service={service} citizenId="CIT-10293" embedded />}
      </div>
    </div>
  );
}
