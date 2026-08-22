"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { Card, Badge, ArchDiagram } from "@/components/ui";
import { api } from "@/lib/api";
import type { ExceptionItem } from "@/lib/types";

function Body() {
  const [items, setItems] = useState<ExceptionItem[]>([]);

  const load = useCallback(() => {
    api.get<ExceptionItem[]>("/api/exceptions").then(setItems).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function retry(id: string) {
    await api.post(`/api/exceptions/${id}/retry`);
    load();
  }
  async function queue(id: string) {
    await api.post(`/api/exceptions/${id}/queue`);
    alert("Request re-queued for automatic retry in 5 minutes.");
    load();
  }

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Integration Exceptions</h1>
      <p className="text-slate-500 text-sm mb-6">Failed requests are automatically retried and queued — never surfaced to citizens as raw errors.</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {items.length === 0 && <p className="text-slate-400 text-sm col-span-full">No open exceptions — all systems nominal.</p>}
        {items.map((e) => (
          <Card key={e.id}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-display font-semibold text-navy-900">{e.api_name}</p>
                <Badge status={e.status} />
              </div>
              <p className="text-sm text-slate-500 mb-1">Error: {e.error}</p>
              <p className="text-xs text-slate-400 mb-4">
                Attempts: {e.attempts} · Request {e.request_id} · Citizen {e.citizen_id}
              </p>
              <div className="flex gap-2">
                <button onClick={() => retry(e.id)} className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg px-3 py-1.5">
                  Retry
                </button>
                <button onClick={() => queue(e.id)} className="border border-slate-200 text-xs font-medium rounded-lg px-3 py-1.5">
                  Queue Request
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-xs font-semibold tracking-widest text-navy-700 mb-4">AUTOMATIC RECOVERY FLOW</p>
      <Card>
        <ArchDiagram steps={["Request", "API failure", "Automatic retry", "Queue", "Retry later", "Success"]} />
      </Card>
    </>
  );
}

export default function AdminExceptionsPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="exceptions">
        <Body />
      </AdminShell>
    </RequireRole>
  );
}
