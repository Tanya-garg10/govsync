"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireRole } from "@/components/require-role";
import { CitizenShell } from "@/components/shells";
import { Card, Badge, Pill, fmtDT, fmtD } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Consent } from "@/lib/types";

function Body() {
  const { user } = useAuth();
  const [consents, setConsents] = useState<Consent[]>([]);

  const load = useCallback(() => {
    if (!user?.citizen_id) return;
    api.get<Consent[]>(`/api/consents?citizen_id=${user.citizen_id}`).then(setConsents).catch(() => {});
  }, [user?.citizen_id]);

  useEffect(() => {
    load();
  }, [load]);

  async function revoke(id: string) {
    await api.post(`/api/consents/${id}/revoke`);
    load();
  }

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">My Consents</h1>
      <p className="text-slate-500 text-sm mb-6">Every time GovSync shares your data with a department, it&apos;s under a consent record you control.</p>
      <div className="space-y-4">
        {consents.length === 0 && <p className="text-slate-400 text-sm">No consent records yet.</p>}
        {consents.map((c) => (
          <Card key={c.id}>
            <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display font-semibold text-navy-900">{c.purpose}</p>
                  <Badge status={c.status} />
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  {c.department} · Consent ID {c.id}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {c.data_requested.map((d) => (
                    <Pill key={d} text={d} tone="bg-slate-100 text-slate-600" />
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  Granted {fmtDT(c.timestamp)} · Expires {fmtD(c.expiry)}
                </p>
              </div>
              {c.status === "Active" && (
                <button onClick={() => revoke(c.id)} className="shrink-0 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg px-4 py-2 text-xs font-semibold">
                  Revoke
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function ConsentsPage() {
  return (
    <RequireRole role="citizen">
      <CitizenShell active="consents">
        <Body />
      </CitizenShell>
    </RequireRole>
  );
}
