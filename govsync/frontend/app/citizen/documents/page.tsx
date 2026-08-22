"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/require-role";
import { CitizenShell } from "@/components/shells";
import { Card, Badge, IconDoc } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { DocumentItem } from "@/lib/types";

function Body() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentItem[]>([]);

  useEffect(() => {
    if (!user?.citizen_id) return;
    api.get<DocumentItem[]>(`/api/citizens/${user.citizen_id}/documents`).then(setDocs).catch(() => {});
  }, [user?.citizen_id]);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Documents</h1>
      <p className="text-slate-500 text-sm mb-6">Documents retrieved from connected registries — reused automatically across applications, no re-uploading needed.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {docs.map((d) => (
          <Card key={d.id}>
            <div className="p-5 flex items-start gap-3">
              <div className="text-slate-400 mt-0.5">
                <IconDoc />
              </div>
              <div className="flex-1">
                <p className="font-medium text-navy-900 text-sm">{d.name}</p>
                <p className="text-xs text-slate-400 mb-2">{d.type}</p>
                <Badge status={d.verified ? "Verified" : "Pending verification"} />
              </div>
            </div>
          </Card>
        ))}
        {docs.length === 0 && <p className="text-slate-400 text-sm col-span-full">No documents on file.</p>}
      </div>
    </>
  );
}

export default function DocumentsPage() {
  return (
    <RequireRole role="citizen">
      <CitizenShell active="documents">
        <Body />
      </CitizenShell>
    </RequireRole>
  );
}
