"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireRole } from "@/components/require-role";
import { CitizenShell } from "@/components/shells";
import { Card, StatCard, Badge, timeAgo, fmtD, IconBell } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Application, NotificationItem, Consent } from "@/lib/types";

function DashboardBody() {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [serviceCount, setServiceCount] = useState(0);

  useEffect(() => {
    if (!user?.citizen_id) return;
    api.get<Application[]>(`/api/applications?citizen_id=${user.citizen_id}`).then(setApps).catch(() => {});
    api.get<NotificationItem[]>(`/api/notifications?citizen_id=${user.citizen_id}`).then(setNotifs).catch(() => {});
    api.get<Consent[]>(`/api/consents?citizen_id=${user.citizen_id}`).then(setConsents).catch(() => {});
    api.get<any[]>("/api/services").then((s) => setServiceCount(s.length)).catch(() => {});
  }, [user?.citizen_id]);

  const active = apps.filter((a) => !["Approved", "Rejected"].includes(a.status)).length;
  const completed = apps.filter((a) => a.status === "Approved").length;
  const pending = apps.filter((a) => a.timeline.some((t) => t.status === "active")).length;
  const firstName = user?.name?.split(" ")[0] || "Citizen";

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Welcome back, {firstName}</h1>
          <p className="text-slate-500 text-sm mt-1">Here&apos;s what&apos;s happening across your connected government services.</p>
        </div>
        <Link href="/demo" className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5">
          ▶ Run Interoperability Demo
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Applications" value={active} />
        <StatCard label="Completed Services" value={completed} tone="text-green-600" />
        <StatCard label="Pending Actions" value={pending} tone="text-amber-600" />
        <StatCard label="Available Services" value={serviceCount} tone="text-teal-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <p className="font-display font-semibold text-navy-900">My Applications</p>
              <Link href="/citizen/applications" className="text-xs font-medium text-teal-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="gs-table w-full">
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Last update</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-slate-400 py-8">
                        No applications yet — browse services to get started.
                      </td>
                    </tr>
                  )}
                  {apps.map((a) => (
                    <tr key={a.id} className="cursor-pointer">
                      <td className="font-medium">
                        <Link href={`/citizen/applications/${a.id}`}>
                          {a.service_name}
                          <div className="text-xs text-slate-400 font-mono-gs">{a.id}</div>
                        </Link>
                      </td>
                      <td>{a.department}</td>
                      <td>
                        <Badge status={a.status} />
                      </td>
                      <td>{timeAgo(a.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <div className="p-5 border-b border-slate-100">
              <p className="font-display font-semibold text-navy-900">Featured service</p>
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <p className="font-semibold text-navy-900">Student Scholarship</p>
                <p className="text-sm text-slate-500 mt-1">Fully integrated end-to-end — identity, education and income are verified automatically through the Integration Hub.</p>
              </div>
              <Link href="/citizen/services/scholarship" className="shrink-0 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-lg px-4 py-2.5">
                Apply now
              </Link>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <p className="font-display font-semibold text-navy-900">Notifications</p>
              <Link href="/citizen/notifications" className="text-xs text-teal-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {notifs.slice(0, 4).map((n) => (
                <div key={n.id} className={`p-4 flex gap-3 ${n.read ? "" : "bg-teal-50/40"}`}>
                  <div className="mt-0.5 text-teal-600">
                    <IconBell />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{timeAgo(n.timestamp)}</p>
                  </div>
                </div>
              ))}
              {notifs.length === 0 && <p className="p-4 text-sm text-slate-400">No notifications.</p>}
            </div>
          </Card>

          <Card>
            <div className="p-5 border-b border-slate-100">
              <p className="font-display font-semibold text-navy-900">Active consents</p>
            </div>
            <div className="p-5 space-y-3">
              {consents
                .filter((c) => c.status === "Active")
                .map((c) => (
                  <div key={c.id} className="text-sm">
                    <p className="font-medium text-navy-900">{c.purpose}</p>
                    <p className="text-xs text-slate-400">
                      {c.department} · expires {fmtD(c.expiry)}
                    </p>
                  </div>
                ))}
              {consents.filter((c) => c.status === "Active").length === 0 && <p className="text-sm text-slate-400">No active consents.</p>}
              <Link href="/citizen/consents" className="text-xs font-medium text-teal-600 hover:underline block pt-1">
                Manage consents →
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function CitizenDashboardPage() {
  return (
    <RequireRole role="citizen">
      <CitizenShell active="dashboard">
        <DashboardBody />
      </CitizenShell>
    </RequireRole>
  );
}
