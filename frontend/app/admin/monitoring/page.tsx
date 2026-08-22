"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { Card, StatCard, Badge } from "@/components/ui";
import { api } from "@/lib/api";
import type { IntegrationRequestLog } from "@/lib/types";

interface Summary {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time_ms: number;
  active_connections: number;
}

function Body() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [logs, setLogs] = useState<IntegrationRequestLog[]>([]);

  useEffect(() => {
    api.get<Summary>("/api/monitoring/summary").then(setSummary).catch(() => {});
    api.get<IntegrationRequestLog[]>("/api/monitoring/logs?limit=25").then(setLogs).catch(() => {});
  }, []);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">API Monitoring</h1>
      <p className="text-slate-500 text-sm mb-6">Live request/response telemetry across every connected system.</p>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Requests" value={summary?.total_requests.toLocaleString() ?? "—"} />
        <StatCard label="Successful" value={summary?.successful_requests.toLocaleString() ?? "—"} tone="text-green-600" />
        <StatCard label="Failed" value={summary?.failed_requests ?? "—"} tone="text-red-600" />
        <StatCard label="Avg Response" value={summary ? `${summary.avg_response_time_ms} ms` : "—"} tone="text-teal-600" />
        <StatCard label="Active Connections" value={summary?.active_connections ?? "—"} />
      </div>
      <Card>
        <div className="p-5 border-b border-slate-100">
          <p className="font-display font-semibold text-navy-900">Request monitor</p>
        </div>
        <div className="overflow-x-auto">
          <table className="gs-table w-full">
            <thead>
              <tr>
                <th>API</th>
                <th>Status</th>
                <th>Detail</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i}>
                  <td className="font-mono-gs">{l.api_name}</td>
                  <td>
                    <Badge status={l.status} />
                  </td>
                  <td className="font-mono-gs text-xs">{l.detail}</td>
                  <td className="font-mono-gs text-xs text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export default function AdminMonitoringPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="monitoring">
        <Body />
      </AdminShell>
    </RequireRole>
  );
}
