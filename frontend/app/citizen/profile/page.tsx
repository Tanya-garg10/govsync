"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/require-role";
import { CitizenShell } from "@/components/shells";
import { Card } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Citizen } from "@/lib/types";

function Body() {
  const { user } = useAuth();
  const [citizen, setCitizen] = useState<Citizen | null>(null);

  useEffect(() => {
    if (!user?.citizen_id) return;
    api.get<Citizen>(`/api/citizens/${user.citizen_id}`).then(setCitizen).catch(() => {});
  }, [user?.citizen_id]);

  const initials = (user?.name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-6">My Profile</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div>
          <Card>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-navy-900 text-white text-xl font-semibold flex items-center justify-center mb-3">{initials}</div>
              <p className="font-display font-bold text-navy-900">{user?.name}</p>
              <p className="text-xs text-slate-400 font-mono-gs">{user?.citizen_id}</p>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <p className="font-display font-semibold text-navy-900 mb-4">Identity registry record</p>
              {citizen ? (
                <dl className="text-sm space-y-3">
                  {Object.entries(citizen).map(([k, v]) =>
                    k === "id" || !v ? null : (
                      <div key={k} className="flex justify-between border-b border-slate-100 pb-2">
                        <dt className="text-slate-400 capitalize">{k.replace(/_/g, " ")}</dt>
                        <dd className="font-medium text-navy-900">{String(v)}</dd>
                      </div>
                    )
                  )}
                </dl>
              ) : (
                <p className="text-sm text-slate-400">Loading…</p>
              )}
              <p className="text-xs text-slate-400 mt-4">Sourced live from the Identity Registry via the Integration Hub · DEMO DATA</p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <RequireRole role="citizen">
      <CitizenShell active="dashboard">
        <Body />
      </CitizenShell>
    </RequireRole>
  );
}
