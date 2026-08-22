"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RequireRole } from "@/components/require-role";
import { OfficialShell } from "@/components/shells";
import { Card, Badge, TimelineItem, fmtD, fmtDT } from "@/components/ui";
import { api } from "@/lib/api";
import type { Application, Consent, AuditLogEntry, DocumentItem } from "@/lib/types";

interface RegistrySnapshot {
  identity: Record<string, any> | null;
  education: Record<string, any> | null;
  income: Record<string, any> | null;
}

function Body() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [reg, setReg] = useState<RegistrySnapshot>({ identity: null, education: null, income: null });
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [audit, setAudit] = useState<AuditLogEntry[]>([]);

  const load = useCallback(async () => {
    const a = await api.get<Application>(`/api/applications/${id}`);
    setApp(a);
    const [identity, education, income, documents, consentList, auditList] = await Promise.all([
      api.get<any>(`/api/identity/${a.citizen_id}`).catch(() => null),
      api.get<any>(`/api/education/${a.citizen_id}`).catch(() => null),
      api.get<any>(`/api/income/${a.citizen_id}`).catch(() => null),
      api.get<DocumentItem[]>(`/api/citizens/${a.citizen_id}/documents`).catch(() => []),
      api.get<Consent[]>(`/api/consents?citizen_id=${a.citizen_id}`).catch(() => []),
      api.get<AuditLogEntry[]>(`/api/audit?user_filter=${a.citizen_id}&limit=8`).catch(() => []),
    ]);
    setReg({ identity, education, income });
    setDocs(documents);
    setConsents(consentList);
    setAudit(auditList);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(decision: "Approved" | "Rejected") {
    await api.post(`/api/applications/${id}/decision`, { decision });
    router.push("/official/dashboard");
  }
  async function requestDocs() {
    await api.post(`/api/applications/${id}/request-docs`);
    alert("Document request sent to citizen — a notification has been triggered.");
  }

  if (!app) return <div className="text-center text-slate-400 py-16">Loading…</div>;

  return (
    <>
      <Link href="/official/dashboard" className="text-xs text-slate-400 hover:text-teal-600">
        ← Back to dashboard
      </Link>
      <div className="flex items-center justify-between mt-3 mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">{app.service_name}</h1>
          <p className="text-xs text-slate-400 font-mono-gs">
            {app.id} · {app.citizen_id}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={requestDocs} className="border border-amber-300 text-amber-700 bg-amber-50 rounded-lg px-4 py-2 text-xs font-semibold">
            Request documents
          </button>
          <button onClick={() => decide("Rejected")} className="border border-red-200 text-red-600 rounded-lg px-4 py-2 text-xs font-semibold hover:bg-red-50">
            Reject
          </button>
          <button onClick={() => decide("Approved")} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-xs font-semibold">
            Approve
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-5">
              <p className="font-display font-semibold text-navy-900 mb-3">Citizen information (via Identity Registry)</p>
              {reg.identity ? (
                <dl className="text-sm grid sm:grid-cols-2 gap-3">
                  {Object.entries(reg.identity).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-slate-400 capitalize">{k.replace(/_/g, " ")}</dt>
                      <dd className="font-medium text-navy-900">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-slate-400">No identity record.</p>
              )}
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <p className="font-display font-semibold text-navy-900 mb-3">Verification results</p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Education Registry</p>
                  {reg.education ? Object.entries(reg.education).map(([k, v]) => <p key={k}><span className="text-slate-400">{k}:</span> {String(v)}</p>) : <p className="text-slate-400">No record</p>}
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Income Registry</p>
                  {reg.income ? Object.entries(reg.income).map(([k, v]) => <p key={k}><span className="text-slate-400">{k}:</span> {String(v)}</p>) : <p className="text-slate-400">No record</p>}
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <p className="font-display font-semibold text-navy-900 mb-3">Documents</p>
              <div className="flex flex-wrap gap-2">
                {docs.map((d) => (
                  <span key={d.id} className="text-xs bg-slate-100 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                    {d.name} <Badge status={d.verified ? "Verified" : "Pending"} />
                  </span>
                ))}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <p className="font-display font-semibold text-navy-900 mb-3">Workflow history</p>
              {app.timeline.map((t, i) => (
                <TimelineItem key={i} step={t.step} system={t.system} status={t.status} timestamp={t.timestamp} duration={t.duration} />
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <div className="p-5">
              <p className="font-display font-semibold text-navy-900 mb-3">Consent</p>
              {consents.length === 0 && <p className="text-sm text-slate-400">No consent on file.</p>}
              {consents.map((c) => (
                <div key={c.id} className="text-sm mb-2">
                  <p className="font-medium text-navy-900">{c.purpose}</p>
                  <p className="text-xs text-slate-400">
                    <Badge status={c.status} /> · expires {fmtD(c.expiry)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <p className="font-display font-semibold text-navy-900 mb-3">Audit trail</p>
              <div className="space-y-2 text-xs">
                {audit.length === 0 && <p className="text-slate-400">No entries.</p>}
                {audit.map((l, i) => (
                  <div key={i} className="border-b border-slate-100 pb-2">
                    <p className="font-medium text-navy-900">{l.action}</p>
                    <p className="text-slate-400">
                      {l.system} · {fmtDT(l.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function OfficialAppDetailPage() {
  return (
    <RequireRole role="official">
      <OfficialShell active="dashboard">
        <Body />
      </OfficialShell>
    </RequireRole>
  );
}
