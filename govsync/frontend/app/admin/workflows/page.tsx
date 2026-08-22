"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { Card } from "@/components/ui";
import { api } from "@/lib/api";

interface WFStep {
  step: string;
  system: string;
  avg_time: string;
  enabled: boolean;
}

function Body() {
  const [steps, setSteps] = useState<WFStep[]>([]);

  useEffect(() => {
    api.get<WFStep[]>("/api/workflows/scholarship").then(setSteps).catch(() => {});
  }, []);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Workflow Orchestration</h1>
      <p className="text-slate-500 text-sm mb-6">Configure the sequence of automated checks and department steps for each service.</p>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-5 border-b border-slate-100">
              <p className="font-display font-semibold text-navy-900">Student Scholarship — workflow</p>
            </div>
            <div className="p-5">
              {steps.map((s, i) => (
                <div key={i} className={`flex items-center gap-4 py-3 ${i < steps.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <span className="w-7 h-7 rounded-full bg-navy-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy-900">{s.step}</p>
                    <p className="text-xs text-slate-400">{s.system}</p>
                  </div>
                  <span className="text-xs font-mono-gs text-slate-400">{s.avg_time}</span>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <input type="checkbox" defaultChecked={s.enabled} className="accent-teal-600" /> Enabled
                  </label>
                </div>
              ))}
              {steps.length === 0 && <p className="text-sm text-slate-400">No workflow template configured yet.</p>}
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <div className="p-5">
              <p className="font-display font-semibold text-navy-900 mb-2">Orchestration rules</p>
              <ul className="text-sm text-slate-500 space-y-2 list-disc list-inside">
                <li>Automated steps run in parallel where data dependencies allow.</li>
                <li>A failed step triggers automatic retry via the exception queue.</li>
                <li>Department review steps are the only manual gate.</li>
                <li>Every transition emits a citizen notification event.</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function AdminWorkflowsPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="workflows">
        <Body />
      </AdminShell>
    </RequireRole>
  );
}
