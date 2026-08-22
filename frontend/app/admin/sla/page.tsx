"use client";

import { RequireRole } from "@/components/require-role";
import { AdminShell } from "@/components/shells";
import { SLAContent } from "@/components/sla-content";

export default function AdminSLAPage() {
  return (
    <RequireRole role="admin">
      <AdminShell active="sla">
        <SLAContent />
      </AdminShell>
    </RequireRole>
  );
}
