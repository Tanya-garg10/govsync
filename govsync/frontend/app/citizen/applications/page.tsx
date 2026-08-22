"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireRole } from "@/components/require-role";
import { CitizenShell } from "@/components/shells";
import { Card, Badge, timeAgo } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Application } from "@/lib/types";

function Body() {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    if (!user?.citizen_id) return;
    api.get<Application[]>(`/api/applications?citizen_id=${user.citizen_id}`).then(setApps).catch(() => {});
  }, [user?.citizen_id]);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">My Applications</h1>
      <p className="text-slate-500 text-sm mb-6">Track every application across departments in one unified view.</p>
      <Card>
        <div className="overflow-x-auto">
          <table className="gs-table w-full">
            <thead>
              <tr>
                <th>Application</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last update</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-10">
                    No applications yet.{" "}
                    <Link href="/citizen/services" className="text-teal-600">
                      Browse services
                    </Link>
                  </td>
                </tr>
              )}
              {apps.map((a) => (
                <tr key={a.id}>
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
                  <td>
                    <Link href={`/citizen/applications/${a.id}`} className="text-teal-600 text-xs font-medium">
                      View timeline →
                    </Link>
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

export default function MyApplicationsPage() {
  return (
    <RequireRole role="citizen">
      <CitizenShell active="applications">
        <Body />
      </CitizenShell>
    </RequireRole>
  );
}
