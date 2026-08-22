"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireRole } from "@/components/require-role";
import { OfficialShell } from "@/components/shells";
import { Card, StatCard, Badge } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Application } from "@/lib/types";

function Body() {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    if (!user?.department) return;
    api.get<Application[]>(`/api/applications?department=${encodeURIComponent(user.department)}`).then(setApps).catch(() => {});
  }, [user?.department]);

  const pending = apps.filter((a) => !["Approved", "Rejected"].includes(a.status)).length;
  const approved = apps.filter((a) => a.status === "Approved").length;
  const rejected = apps.filter((a) => a.status === "Rejected").length;
  const breaches = apps.filter((a) => {
    const days = (Date.now() - new Date(a.created_at).getTime()) / 86400000;
    return days > a.sla_target_days;
  }).length;

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Government Department Dashboard</h1>
      <p className="text-slate-500 text-sm mb-6">{user?.department}</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Applications" value={apps.length} />
        <StatCard label="Pending Review" value={pending} tone="text-amber-600" />
        <StatCard label="Approved" value={approved} tone="text-green-600" />
        <StatCard label="Rejected" value={rejected} tone="text-red-600" />
        <StatCard label="SLA Breaches" value={breaches} tone={breaches > 0 ? "text-red-600" : "text-green-600"} />
      </div>

      <Card>
        <div className="p-5 border-b border-slate-100">
          <p className="font-display font-semibold text-navy-900">Applications</p>
        </div>
        <div className="overflow-x-auto">
          <table className="gs-table w-full">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Citizen</th>
                <th>Service</th>
                <th>Current stage</th>
                <th>Status</th>
                <th>Officer</th>
                <th>SLA</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 py-10">
                    No applications for this department yet.
                  </td>
                </tr>
              )}
              {apps.map((a) => {
                const days = (Date.now() - new Date(a.created_at).getTime()) / 86400000;
                const breach = days > a.sla_target_days;
                return (
                  <tr key={a.id}>
                    <td className="font-mono-gs text-xs">{a.id}</td>
                    <td>{a.citizen_id}</td>
                    <td>{a.service_name}</td>
                    <td className="text-xs text-slate-500">{a.current_stage}</td>
                    <td>
                      <Badge status={a.status} />
                    </td>
                    <td className="text-xs">{a.assigned_officer}</td>
                    <td>
                      <Badge status={breach ? "Breach" : "On track"} />
                    </td>
                    <td>
                      <Link href={`/official/applications/${a.id}`} className="text-teal-600 text-xs font-semibold">
                        Review →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export default function OfficialDashboardPage() {
  return (
    <RequireRole role="official">
      <OfficialShell active="dashboard">
        <Body />
      </OfficialShell>
    </RequireRole>
  );
}
