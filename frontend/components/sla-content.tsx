"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SLARow } from "@/lib/types";

export function SLAContent() {
  const [rows, setRows] = useState<SLARow[]>([]);

  useEffect(() => {
    api.get<SLARow[]>("/api/sla").then(setRows).catch(() => {});
  }, []);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Service-Level Compliance</h1>
      <p className="text-slate-500 text-sm mb-6">Measurable improvement from removing manual re-verification steps.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {rows.map((s) => (
          <div key={s.service_name} className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="font-display font-semibold text-navy-900 mb-3">{s.service_name}</p>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div>
                <p className="text-xs text-slate-400">SLA Target</p>
                <p className="font-display font-bold text-navy-900">{s.target_days}d</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Average</p>
                <p className="font-display font-bold text-teal-600">{s.average_days}d</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Compliance</p>
                <p className={`font-display font-bold ${s.compliance_pct >= 90 ? "text-green-600" : "text-amber-600"}`}>{s.compliance_pct}%</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${s.compliance_pct >= 90 ? "bg-green-600" : "bg-amber-500"}`} style={{ width: `${s.compliance_pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
