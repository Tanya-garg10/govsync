"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RequireRole } from "@/components/require-role";
import { CitizenShell } from "@/components/shells";
import { Card, Badge, Pill, TimelineItem, fmtD } from "@/components/ui";
import { api } from "@/lib/api";
import type { Application } from "@/lib/types";

function Body() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Application>(`/api/applications/${id}`)
      .then(setApp)
      .catch(() => setApp(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center text-slate-400 py-16">Loading…</div>;
  if (!app) return <div className="text-center text-slate-400 py-16">Application not found.</div>;

  const systems = Array.from(new Set(app.timeline.map((t) => t.system)));

  return (
    <>
      <Link href="/citizen/applications" className="text-xs text-slate-400 hover:text-teal-600">
        ← Back to applications
      </Link>
      <div className="grid lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <h1 className="font-display text-xl font-bold text-navy-900">{app.service_name}</h1>
                <Badge status={app.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono-gs mb-6">
                {app.id} · {app.department}
              </p>
              <p className="font-display font-semibold text-navy-900 mb-4">Application timeline</p>
              <div>
                {app.timeline.map((t, i) => (
                  <TimelineItem key={i} step={t.step} system={t.system} status={t.status} timestamp={t.timestamp} duration={t.duration} />
                ))}
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <div className="p-5">
              <p className="font-display font-semibold text-navy-900 mb-3">Details</p>
              <dl className="text-sm space-y-2.5">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Submitted</dt>
                  <dd>{fmtD(app.created_at)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Assigned officer</dt>
                  <dd>{app.assigned_officer}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">SLA target</dt>
                  <dd>{app.sla_target_days} days</dd>
                </div>
              </dl>
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <p className="font-display font-semibold text-navy-900 mb-2">Data sourced via</p>
              <div className="flex flex-wrap gap-1.5">
                {systems.map((s) => (
                  <Pill key={s} text={s} tone="bg-teal-100 text-teal-700" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function ApplicationDetailPage() {
  return (
    <RequireRole role="citizen">
      <CitizenShell active="applications">
        <Body />
      </CitizenShell>
    </RequireRole>
  );
}
