"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { Card, StatCard } from "@/components/ui";
import { api } from "@/lib/api";
import type { DataQualitySummary, DataQualityIssue } from "@/lib/types";

function Body() {
  const [summary, setSummary] = useState<DataQualitySummary | null>(null);
  const [issues, setIssues] = useState<DataQualityIssue[]>([]);

  useEffect(() => {
    api.get<DataQualitySummary>("/api/dataquality/summary").then(setSummary).catch(() => {});
    api.get<DataQualityIssue[]>("/api/dataquality/issues").then(setIssues).catch(() => {});
  }, []);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Data Quality</h1>
      <p className="text-slate-500 text-sm mb-6">Continuous checks across every connected registry.</p>
      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        <Card className="sm:col-span-1">
          <div className="p-6 text-center">
            <p className="text-xs text-slate-500 mb-2">Data Quality Score</p>
            <p className="text-5xl font-display font-bold text-green-600">{summary?.valid_pct ?? "—"}%</p>
          </div>
        </Card>
        <div className="sm:col-span-2 grid grid-cols-2 gap-4">
          <StatCard label="Duplicate Records" value={summary?.duplicate ?? "—"} tone="text-amber-600" />
          <StatCard label="Missing Information" value={summary?.missing ?? "—"} tone="text-amber-600" />
          <StatCard label="Invalid Formats" value={summary?.invalid ?? "—"} tone="text-red-600" />
          <StatCard label="Conflicting Records" value={summary?.conflicting ?? "—"} tone="text-red-600" />
        </div>
      </div>
      <Card>
        <div className="p-5">
          <p className="font-display font-semibold text-navy-900 mb-3">Open issues (click to review)</p>
          <div className="space-y-2">
            {issues
              .filter((i) => !i.resolved)
              .map((i) => (
                <button
                  key={i.id}
                  onClick={() => alert(`Issue detail: ${i.description}. Routed to Master Data for reconciliation.`)}
                  className="w-full text-left text-sm bg-slate-50 hover:bg-slate-100 rounded-lg px-4 py-2.5"
                >
                  {i.issue_type.charAt(0).toUpperCase() + i.issue_type.slice(1)} — {i.description}
                </button>
              ))}
            {issues.filter((i) => !i.resolved).length === 0 && <p className="text-sm text-slate-400">No open issues.</p>}
          </div>
        </div>
      </Card>
    </>
  );
}

export default function AdminDataQualityPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="dataquality">
        <Body />
      </AdminShell>
    </RequireRole>
  );
}
