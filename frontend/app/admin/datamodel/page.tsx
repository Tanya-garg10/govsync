"use client";

import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { Card, ArchDiagram } from "@/components/ui";

function Body() {
  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Common Data Model</h1>
      <p className="text-slate-500 text-sm mb-6">Different systems use different field names. GovSync normalizes every record before it reaches a service.</p>
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        <Card>
          <div className="p-5">
            <p className="text-xs font-semibold text-slate-400 mb-2">SYSTEM A — Education Registry</p>
            <pre className="font-mono-gs text-xs bg-slate-50 rounded-lg p-3 overflow-x-auto">{`{
  "full_name": "Rahul Kumar",
  "dob": "12/04/2004"
}`}</pre>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-xs font-semibold text-slate-400 mb-2">SYSTEM B — Scholarship System</p>
            <pre className="font-mono-gs text-xs bg-slate-50 rounded-lg p-3 overflow-x-auto">{`{
  "name": "Rahul Kumar",
  "dateOfBirth": "2004-04-12"
}`}</pre>
          </div>
        </Card>
        <Card className="border-teal-200 bg-teal-50/40">
          <div className="p-5">
            <p className="text-xs font-semibold text-teal-700 mb-2">GOVSYNC — NORMALIZED</p>
            <pre className="font-mono-gs text-xs bg-white rounded-lg p-3 overflow-x-auto border border-teal-100">{`{
  "name": "Rahul Kumar",
  "date_of_birth": "2004-04-12"
}`}</pre>
          </div>
        </Card>
      </div>
      <Card>
        <ArchDiagram steps={["External Systems", "Data Mapping", "Validation", "Common Data Model", "Unified Services"]} />
      </Card>
    </>
  );
}

export default function AdminDataModelPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="datamodel">
        <Body />
      </AdminShell>
    </RequireRole>
  );
}
