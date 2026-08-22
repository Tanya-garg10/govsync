"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { Card, StatCard, Badge } from "@/components/ui";
import { api } from "@/lib/api";
import type { Connector, ExceptionItem, Application } from "@/lib/types";

interface HealthRow {
  name: string;
  status: string;
}

function Body() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [health, setHealth] = useState<HealthRow[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    api.get<Connector[]>("/api/connectors").then(setConnectors).catch(() => {});
    api.get<HealthRow[]>("/api/monitoring/health").then(setHealth).catch(() => {});
    api.get<ExceptionItem[]>("/api/exceptions").then(setExceptions).catch(() => {});
    api.get<Application[]>("/api/applications").then(setApps).catch(() => {});
  }, []);

  const connectedCount = connectors.filter((c) => c.status === "Connected").length;
  const pending = apps.filter((a) => a.status === "Submitted").length;

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">System Health</h1>
      <p className="text-slate-500 text-sm mb-6">Real-time status of every connected system and the orchestration queue.</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Connected Systems" value={`${connectedCount}/${connectors.length}`} />
        <StatCard label="API Uptime (30d)" value="99.94%" tone="text-green-600" />
        <StatCard label="Pending Workflows" value={pending} tone="text-amber-600" />
        <StatCard label="Queue Size" value={exceptions.length} tone={exceptions.length > 0 ? "text-amber-600" : "text-green-600"} />
      </div>
      <Card>
        <div className="p-5 border-b border-slate-100">
          <p className="font-display font-semibold text-navy-900">System health</p>
        </div>
        <div className="divide-y divide-slate-100">
          {health.map((h) => (
            <div key={h.name} className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-navy-900">{h.name}</span>
              <Badge status={h.status} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

export default function AdminHealthPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="health">
        <Body />
      </AdminShell>
    </RequireRole>
  );
}
