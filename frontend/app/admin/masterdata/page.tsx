"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { Card, Badge, fmtD, timeAgo } from "@/components/ui";
import { api } from "@/lib/api";
import type { Citizen, Application, DataQualityIssue } from "@/lib/types";

const DEMO_CITIZEN_IDS = ["CIT-10293", "CIT-10294", "CIT-10295"];

interface Row extends Citizen {
  recordCount: number;
}

function Body() {
  const [rows, setRows] = useState<Row[]>([]);
  const [dupes, setDupes] = useState<DataQualityIssue[]>([]);

  const load = useCallback(async () => {
    const citizens = await Promise.all(DEMO_CITIZEN_IDS.map((id) => api.get<Citizen>(`/api/citizens/${id}`)));
    const apps = await Promise.all(DEMO_CITIZEN_IDS.map((id) => api.get<Application[]>(`/api/applications?citizen_id=${id}`)));
    setRows(citizens.map((c, i) => ({ ...c, recordCount: apps[i].length })));
    const issues = await api.get<DataQualityIssue[]>("/api/dataquality/issues");
    setDupes(issues.filter((i) => i.issue_type === "duplicate"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function merge(issueId: number) {
    await api.post(`/api/dataquality/issues/${issueId}/resolve`);
    load();
  }

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Master Data</h1>
      <p className="text-slate-500 text-sm mb-6">A single golden record per citizen, reconciled across every connected registry.</p>
      <Card>
        <div className="overflow-x-auto">
          <table className="gs-table w-full">
            <thead>
              <tr>
                <th>Citizen ID</th>
                <th>Name</th>
                <th>Date of Birth</th>
                <th>Mobile</th>
                <th>Department Records</th>
                <th>Verification</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono-gs text-xs">{r.id}</td>
                  <td>{r.name}</td>
                  <td>{fmtD(r.dob)}</td>
                  <td>{r.mobile}</td>
                  <td>{r.recordCount} record(s)</td>
                  <td>
                    <Badge status="Verified" />
                  </td>
                  <td className="text-xs text-slate-400">{timeAgo(new Date().toISOString())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs font-semibold tracking-widest text-navy-700 mt-10 mb-4">POTENTIAL DUPLICATES DETECTED</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {dupes.map((d) => (
          <Card key={d.id}>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Record A · {d.record_a?.src}</p>
                  <p className="font-medium">{d.record_a?.name}</p>
                  <p className="text-xs text-slate-400">DOB {d.record_a?.dob}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Record B · {d.record_b?.src}</p>
                  <p className="font-medium">{d.record_b?.name}</p>
                  <p className="text-xs text-slate-400">DOB {d.record_b?.dob}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Similarity: <strong className="text-navy-900">{d.similarity}%</strong>
              </p>
              {d.resolved ? (
                <Badge status="Merged" />
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => merge(d.id)} className="bg-navy-900 text-white text-xs font-semibold rounded-lg px-3 py-1.5">
                    Merge
                  </button>
                  <button onClick={() => alert("Marked for manual review.")} className="border border-slate-200 text-xs font-medium rounded-lg px-3 py-1.5">
                    Review
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function AdminMasterDataPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="masterdata">
        <Body />
      </AdminShell>
    </RequireRole>
  );
}
