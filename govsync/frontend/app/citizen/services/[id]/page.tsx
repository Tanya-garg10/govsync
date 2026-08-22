"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RequireRole } from "@/components/require-role";
import { CitizenShell } from "@/components/shells";
import { Card, Pill, IconHub } from "@/components/ui";
import { IntegrationFlowRunner } from "@/components/integration-flow";
import { Modal } from "@/components/modal";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Service } from "@/lib/types";

function ServiceDetailBody() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [showFlow, setShowFlow] = useState(false);
  const [manualNotice, setManualNotice] = useState(false);

  useEffect(() => {
    api.get<Service>(`/api/services/${id}`).then(setService).catch(() => setService(null));
  }, [id]);

  if (!service) return <div className="text-center text-slate-400 py-16">Loading service…</div>;

  return (
    <>
      <Link href="/citizen/services" className="text-xs text-slate-400 hover:text-teal-600">
        ← Back to services
      </Link>
      <div className="grid lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Pill text={service.category || ""} />
                {service.integrated && (
                  <span className="text-xs font-semibold text-teal-600 flex items-center gap-1">
                    <IconHub /> Integration Hub enabled
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">{service.name}</h1>
              <p className="text-sm text-slate-400 mb-4">
                {service.department} · Processing time {service.processing_time}
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">{service.eligibility}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <p className="font-display font-semibold text-navy-900 mb-3">Required information</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {service.required_info.map((i) => (
                  <Pill key={i} text={i} tone="bg-teal-100 text-teal-700" />
                ))}
              </div>
              <p className="font-display font-semibold text-navy-900 mb-3">Required documents</p>
              <div className="flex flex-wrap gap-2">
                {service.required_docs.map((i) => (
                  <Pill key={i} text={i} tone="bg-slate-100 text-slate-600" />
                ))}
              </div>
            </div>
          </Card>
          {service.integrated && (
            <Card>
              <div className="p-6">
                <p className="font-display font-semibold text-navy-900 mb-3">How GovSync fills this in for you</p>
                <p className="text-sm text-slate-500 mb-4">Instead of typing this information again, GovSync retrieves it from connected registries — with your consent — through the Integration Hub.</p>
                <div className="flex flex-wrap items-center gap-2 font-mono-gs text-xs text-slate-500">
                  {["Consent", "Identity", "Education", "Income", "Documents"].map((s) => (
                    <span key={s} className="bg-slate-100 rounded-md px-2.5 py-1.5">
                      {s}
                    </span>
                  ))}
                  <span>→</span>
                  <span className="bg-teal-100 text-teal-700 rounded-md px-2.5 py-1.5">Eligibility</span>
                  <span>→</span>
                  <span className="bg-navy-900 text-white rounded-md px-2.5 py-1.5">Submitted</span>
                </div>
              </div>
            </Card>
          )}
        </div>
        <div>
          <Card>
            <div className="p-6">
              <p className="font-display font-semibold text-navy-900 mb-1">Ready to apply?</p>
              <p className="text-sm text-slate-500 mb-4">
                {service.integrated ? "We'll ask for your consent, then automatically fetch and verify your information." : "This service currently requires manual document upload — automated integration coming soon."}
              </p>
              <button
                onClick={() => (service.integrated ? setShowFlow(true) : setManualNotice(true))}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg py-2.5 text-sm"
              >
                {service.integrated ? "Start application" : "Start manual application"}
              </button>
            </div>
          </Card>
        </div>
      </div>

      {showFlow && user?.citizen_id && <IntegrationFlowRunner service={service} citizenId={user.citizen_id} onClose={() => setShowFlow(false)} />}

      {manualNotice && (
        <Modal onClose={() => setManualNotice(false)}>
          <div className="p-6">
            <p className="font-display font-bold text-navy-900 mb-3">Manual service</p>
            <p className="text-sm text-slate-600 mb-4">
              Manual services aren&apos;t wired to the Integration Hub yet in this prototype. Try <strong>Student Scholarship</strong>, <strong>Income Certificate</strong>,{" "}
              <strong>Residence Certificate</strong>, <strong>Education Assistance Grant</strong>, or <strong>Employment Registration</strong> for the full automated flow.
            </p>
            <button onClick={() => setManualNotice(false)} className="w-full bg-navy-900 text-white rounded-lg py-2.5 text-sm font-semibold">
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default function ServiceDetailPage() {
  return (
    <RequireRole role="citizen">
      <CitizenShell active="services">
        <ServiceDetailBody />
      </CitizenShell>
    </RequireRole>
  );
}
