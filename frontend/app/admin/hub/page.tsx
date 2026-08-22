"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { Card, Badge, IconHub, ArchDiagram } from "@/components/ui";
import { api } from "@/lib/api";
import type { Connector } from "@/lib/types";

function Body() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", department: "", endpoint: "", auth_type: "OAuth 2.0", connector_type: "REST API" });

  const load = useCallback(() => {
    api.get<Connector[]>("/api/connectors").then(setConnectors).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function register() {
    if (!form.name.trim()) return;
    await api.post("/api/connectors", form);
    setForm({ name: "", department: "", endpoint: "", auth_type: "OAuth 2.0", connector_type: "REST API" });
    setShowForm(false);
    load();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-900">Integration Hub</h1>
        <button onClick={() => setShowForm((v) => !v)} className="text-sm font-semibold bg-navy-900 text-white rounded-lg px-4 py-2">
          + Register system
        </button>
      </div>
      <p className="text-slate-500 text-sm mb-6">Government systems connect here through adapters — nothing about the source system changes.</p>

      {showForm && (
        <div className="mb-6">
          <Card>
            <div className="p-5 grid sm:grid-cols-2 gap-3">
              <input placeholder="System name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full" />
              <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full" />
              <input placeholder="API endpoint e.g. /api/pension" value={form.endpoint} onChange={(e) => setForm({ ...form, endpoint: e.target.value })} className="w-full" />
              <select value={form.auth_type} onChange={(e) => setForm({ ...form, auth_type: e.target.value })} className="w-full">
                <option>OAuth 2.0</option>
                <option>API Key</option>
                <option>mTLS</option>
                <option>Legacy Adapter (DB)</option>
              </select>
              <button onClick={register} className="sm:col-span-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-lg px-4 py-2">
                Register connector
              </button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {connectors.map((c) => (
          <Card key={c.id}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                  <IconHub />
                </div>
                <Badge status={c.status} />
              </div>
              <p className="font-display font-semibold text-navy-900">{c.name}</p>
              <p className="text-xs text-slate-400 mb-3">{c.department}</p>
              <p className="font-mono-gs text-xs bg-slate-50 rounded-md px-2.5 py-1.5 mb-3 text-slate-600">{c.endpoint}</p>
              <dl className="text-xs space-y-1.5 text-slate-500">
                <div className="flex justify-between">
                  <dt>Auth type</dt>
                  <dd className="text-slate-700">{c.auth_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Last sync</dt>
                  <dd className="text-slate-700">{new Date(c.last_sync).toLocaleTimeString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Requests today</dt>
                  <dd className="text-slate-700">{c.requests_today.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Errors</dt>
                  <dd className={c.error_count > 0 ? "text-red-600" : "text-slate-700"}>{c.error_count}</dd>
                </div>
              </dl>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs font-semibold tracking-widest text-navy-700 mt-10 mb-4">ARCHITECTURE — SYSTEMS ARE NEVER REPLACED</p>
      <Card>
        <ArchDiagram steps={["Existing Government System", "Connector / Adapter", "Integration Hub", "Common Data Model", "Unified Services"]} />
      </Card>
    </>
  );
}

export default function AdminHubPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="hub">
        <Body />
      </AdminShell>
    </RequireRole>
  );
}
