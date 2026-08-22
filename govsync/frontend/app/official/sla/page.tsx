"use client";

import { RequireRole } from "@/components/require-role";
import { OfficialShell } from "@/components/shells";
import { SLAContent } from "@/components/sla-content";

export default function OfficialSLAPage() {
  return (
    <RequireRole role="official">
      <OfficialShell active="sla">
        <SLAContent />
      </OfficialShell>
    </RequireRole>
  );
}
