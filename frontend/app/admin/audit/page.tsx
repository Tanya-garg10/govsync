"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { Card, Badge, fmtDT } from "@/components/ui";
import { api } from "@/lib/api";
import type { AuditLogEntry } from "@/lib/types";

function Body() {
  const [rows, setRows] = useState<AuditLogEntry[]>([]);
  const [userFilter, setUserFilter] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [action, setAction] = useState("All actions");
  const [actions, setActions] = useState<string[]>([]);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (userFilter) params.set("user_filter", userFilter);
    if (status !== "All statuses") params.set("status_filter", status);
    if (action !== "All actions") params.set("action", action);
    params.set("limit", "60");
    const data = await api.get<AuditLogEntry[]>(`/api/audit?${params.toString()}`);
    setRows(data);
    if (actions.length === 0) setActions(Array.from(new Set(data.map((r) => r.action))));
  }, [userFilter, status, action, actions.length]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFilter, status, action]);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Audit &amp; Compliance</h1>
      <p className="text-slate-500 text-sm mb-6">Every data access, share, and decision is logged with purpose and consent status.</p>
      <div className="flex flex-wrap gap-3 mb-5">
        <input value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="Filter by user…" className="w-48" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All statuses</option>
          <option>SUCCESS</option>
          <option>FAILED</option>
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option>All actions</option>
          {actions.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="gs-table w-full">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Purpose</th>
                <th>System</th>
                <th>Consent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-8">
                    No matching entries.
                  </td>
                </tr>
              )}
              {rows.map((l, i) => (
                <tr key={i}>
                  <td className="font-mono-gs text-xs">{fmtDT(l.timestamp)}</td>
                  <td className="font-mono-gs text-xs">{l.user}</td>
                  <td>{l.action}</td>
                  <td className="text-xs">{l.purpose}</td>
                  <td className="text-xs">{l.system}</td>
                  <td className="text-xs">{l.consent}</td>
                  <td>
                    <Badge status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export default function AdminAuditPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="audit">
        <Body />
      </AdminShell>
    </RequireRole>
  );
}
