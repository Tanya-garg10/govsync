"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireRole } from "@/components/require-role";
import { CitizenShell } from "@/components/shells";
import { Card, IconBell, fmtDT } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { NotificationItem } from "@/lib/types";

function Body() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);

  const load = useCallback(() => {
    if (!user?.citizen_id) return;
    api.get<NotificationItem[]>(`/api/notifications?citizen_id=${user.citizen_id}`).then(setNotifs).catch(() => {});
  }, [user?.citizen_id]);

  useEffect(() => {
    load();
  }, [load]);

  async function markAllRead() {
    if (!user?.citizen_id) return;
    await api.post(`/api/notifications/read-all?citizen_id=${user.citizen_id}`);
    load();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold text-navy-900">Notifications</h1>
        <button onClick={markAllRead} className="text-xs font-medium text-teal-600 hover:underline">
          Mark all as read
        </button>
      </div>
      <p className="text-slate-500 text-sm mb-6">Real-time events triggered by activity across connected systems.</p>
      <Card>
        <div className="divide-y divide-slate-100">
          {notifs.length === 0 && <p className="p-6 text-sm text-slate-400">No notifications.</p>}
          {notifs.map((n) => (
            <div key={n.id} className={`p-4 flex gap-3 ${n.read ? "" : "bg-teal-50/40"}`}>
              <div className="mt-0.5 text-teal-600">
                <IconBell />
              </div>
              <div>
                <p className="text-sm text-slate-700">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{fmtDT(n.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

export default function NotificationsPage() {
  return (
    <RequireRole role="citizen">
      <CitizenShell active="dashboard">
        <Body />
      </CitizenShell>
    </RequireRole>
  );
}
