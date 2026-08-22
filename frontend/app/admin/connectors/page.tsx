"use client";

import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { Card, ArchDiagram } from "@/components/ui";

const TYPES: [string, string, string][] = [
  ["REST API", "Modern JSON over HTTPS", "Identity Registry, Education Registry"],
  ["SOAP", "XML-based legacy web services", "Pension Directorate (planned)"],
  ["Database", "Direct read replica connection", "Labour Dept. Legacy DB"],
  ["CSV", "Scheduled batch file exchange", "Rural Development Reports"],
  ["Webhook", "Event push from source system", "Scholarship System status updates"],
  ["Legacy Adapter", "Wraps mainframe / proprietary protocols in a modern API shell", "Labour Dept. Legacy DB"],
];

function Body() {
  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">System Connectors</h1>
      <p className="text-slate-500 text-sm mb-6">GovSync supports multiple integration patterns so no existing system needs to be rebuilt.</p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {TYPES.map(([t, d, ex]) => (
          <Card key={t}>
            <div className="p-5">
              <p className="font-display font-semibold text-navy-900 mb-1">{t}</p>
              <p className="text-sm text-slate-500 mb-2">{d}</p>
              <p className="text-xs text-slate-400">e.g. {ex}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <ArchDiagram steps={["Legacy Government System", "Legacy Adapter", "Data Transformation", "GovSync Integration Hub", "Modern API"]} />
      </Card>
    </>
  );
}

export default function AdminConnectorsPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="connectors">
        <Body />
      </AdminShell>
    </RequireRole>
  );
}
