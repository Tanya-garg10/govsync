"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireRole } from "@/components/require-role";
import { CitizenShell } from "@/components/shells";
import { Card, Badge, fmtD } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Grievance } from "@/lib/types";

function Body() {
  const { user } = useAuth();
  const [list, setList] = useState<Grievance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [dept, setDept] = useState("Dept. of Education");

  const load = useCallback(() => {
    if (!user?.citizen_id) return;
    api.get<Grievance[]>(`/api/grievances?citizen_id=${user.citizen_id}`).then(setList).catch(() => {});
  }, [user?.citizen_id]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    if (!subject.trim() || !user?.citizen_id) return;
    await api.post("/api/grievances", { citizen_id: user.citizen_id, subject, department: dept });
    setSubject("");
    setShowForm(false);
    load();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold text-navy-900">Grievances</h1>
        <button onClick={() => setShowForm((v) => !v)} className="text-sm font-semibold bg-navy-900 text-white rounded-lg px-4 py-2">
          + New grievance
        </button>
      </div>
      <p className="text-slate-500 text-sm mb-6">Raise and track issues with any government service.</p>

      {showForm && (
        <div className="mb-6">
          <Card>
            <div className="p-5 space-y-3">
              <input value={subject} onChange={(e) => setSubject(e.target.value)} type="text" placeholder="Subject" className="w-full" />
              <select value={dept} onChange={(e) => setDept(e.target.value)} className="w-full">
                <option>Dept. of Education</option>
                <option>Revenue Department</option>
                <option>Labour Department</option>
              </select>
              <button onClick={submit} className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-lg px-4 py-2">
                Submit grievance
              </button>
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-3">
        {list.length === 0 && <p className="text-slate-400 text-sm">No grievances filed.</p>}
        {list.map((g) => (
          <Card key={g.id}>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-navy-900 text-sm">{g.subject}</p>
                <p className="text-xs text-slate-400">
                  {g.id} · {g.department} · {fmtD(g.submitted_at)}
                </p>
              </div>
              <Badge status={g.status} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function GrievancesPage() {
  return (
    <RequireRole role="citizen">
      <CitizenShell active="grievances">
        <Body />
      </CitizenShell>
    </RequireRole>
  );
}
