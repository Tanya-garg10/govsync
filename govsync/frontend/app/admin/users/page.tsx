"use client";

import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { Card, Badge } from "@/components/ui";

const USERS: [string, string, string][] = [
  ["Rahul Kumar", "Citizen", "Active"],
  ["Priya Sharma", "Citizen", "Active"],
  ["Aman Verma", "Citizen", "Active"],
  ["K. Meena", "Government Official — Revenue Department", "Active"],
  ["S. Rathi", "Government Official — Labour Department", "Active"],
  ["System Administrator", "Administrator", "Active"],
];

function Body() {
  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Users &amp; Roles</h1>
      <p className="text-slate-500 text-sm mb-6">Role-based access control governs what each account can see and do across GovSync.</p>
      <Card>
        <div className="overflow-x-auto">
          <table className="gs-table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {USERS.map(([n, r, s]) => (
                <tr key={n}>
                  <td className="font-medium">{n}</td>
                  <td className="text-xs text-slate-500">{r}</td>
                  <td>
                    <Badge status={s} />
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

export default function AdminUsersPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="users">
        <Body />
      </AdminShell>
    </RequireRole>
  );
}
