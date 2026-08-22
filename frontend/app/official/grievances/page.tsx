"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/require-role";
import { OfficialShell } from "@/components/shells";
import { Card, Badge, fmtD } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Grievance } from "@/lib/types";

function Body() {
  const { user } = useAuth();
  const [list, setList] = useState<Grievance[]>([]);

  useEffect(() => {
    if (!user?.department) return;
    api.get<Grievance[]>(`/api/grievances?department=${encodeURIComponent(user.department)}`).then(setList).catch(() => {});
  }, [user?.department]);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Grievances</h1>
      <p className="text-slate-500 text-sm mb-6">Citizen-submitted issues routed to your department.</p>
      <Card>
        <div className="overflow-x-auto">
          <table className="gs-table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Citizen</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-8">
                    No grievances for this department.
                  </td>
                </tr>
              )}
              {list.map((g) => (
                <tr key={g.id}>
                  <td className="font-mono-gs text-xs">{g.id}</td>
                  <td>{g.citizen_id}</td>
                  <td>{g.subject}</td>
                  <td>
                    <Badge status={g.status} />
                  </td>
                  <td>{fmtD(g.submitted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export default function OfficialGrievancesPage() {
  return (
    <RequireRole role="official">
      <OfficialShell active="grievances">
        <Body />
      </OfficialShell>
    </RequireRole>
  );
}
