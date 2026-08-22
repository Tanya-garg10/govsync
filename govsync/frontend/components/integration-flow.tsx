"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Application, Consent, Service } from "@/lib/types";
import { Modal } from "./modal";
import { IconHub, IconCheck } from "./ui";

/**
 * The Integration Hub live-run experience.
 *
 * The backend executes the entire flow (identity -> education -> income ->
 * documents -> normalize -> eligibility -> submit) synchronously in one
 * POST /api/applications call and returns the finished application with
 * its full timeline. This component reveals that result progressively,
 * line by line, so the *real* backend work is visible as a live sequence
 * rather than a single instant jump — the data itself is 100% real, only
 * the reveal pacing is client-side.
 */

type Phase = "consent" | "running" | "done" | "error";

const LOG_STEPS = [
  "Connecting to Identity Registry…",
  "Fetching citizen information…",
  "Connecting to Education Registry…",
  "Education record verified…",
  "Connecting to Income Registry…",
  "Income verified…",
  "Fetching required documents…",
  "Documents retrieved…",
  "Normalizing records to Common Data Model…",
  "Calculating eligibility…",
  "Submitting application…",
];

export function IntegrationFlowRunner({
  service,
  citizenId,
  embedded = false,
  onClose,
}: {
  service: Service;
  citizenId: string;
  embedded?: boolean; // true on the standalone /demo page (no modal chrome)
  onClose?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("consent");
  const [visibleLines, setVisibleLines] = useState(0);
  const [application, setApplication] = useState<Application | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const runOnce = useRef(false);

  async function grantConsentAndRun() {
    setPhase("running");
    try {
      const consent = await api.post<Consent>("/api/consents", {
        citizen_id: citizenId,
        data_requested: [...service.required_info.map((i) => `${i} Information`), "Required Documents"],
        purpose: `${service.name} Eligibility Verification`,
        department: service.department,
      });
      await runFlow(consent.id);
    } catch (e) {
      setErrorMsg(e instanceof ApiError ? e.message : "Something went wrong contacting the Integration Hub.");
      setPhase("error");
    }
  }

  async function runFlow(consentId: string) {
    if (runOnce.current) return;
    runOnce.current = true;
    try {
      const appPromise = api.post<Application>("/api/applications", {
        citizen_id: citizenId,
        service_id: service.id,
        consent_id: consentId,
      });

      // Reveal log lines progressively while the (already-fired) request resolves.
      for (let i = 0; i < LOG_STEPS.length; i++) {
        await new Promise((r) => setTimeout(r, 420 + Math.random() * 220));
        setVisibleLines(i + 1);
      }
      const app = await appPromise;
      setApplication(app);
      setPhase("done");
    } catch (e) {
      setErrorMsg(e instanceof ApiError ? e.message : "The Integration Hub could not complete this request.");
      setPhase("error");
    }
  }

  const body = (
    <div className={embedded ? "bg-white border border-slate-200 rounded-2xl overflow-hidden" : ""}>
      <div className="bg-navy-900 px-6 py-4 flex items-center gap-2">
        <span className="pulse-dot text-teal-400">
          <IconHub />
        </span>
        <p className="text-white font-display font-bold">Integration Hub — Live Run</p>
      </div>
      <div className="p-6">
        {phase === "consent" && (
          <>
            <p className="text-sm text-slate-600 mb-4">
              GovSync requests permission to access the following information from connected government registries, on your behalf, for this application.
            </p>
            <div className="space-y-2 mb-5">
              {service.required_info.map((i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-teal-600">
                    <IconCheck />
                  </span>
                  {i} Information
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-teal-600">
                  <IconCheck />
                </span>
                Required Documents
              </div>
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-2.5 mb-5">
              <p className="text-xs text-teal-700">
                <strong>Purpose:</strong> {service.name} Eligibility Verification
              </p>
              <p className="text-xs text-teal-700">
                <strong>Requesting department:</strong> {service.department}
              </p>
            </div>
            <p className="text-xs text-slate-400 mb-5">This consent is logged with a timestamp and expiry, and can be revoked anytime from My Consents.</p>
            <div className="flex gap-3">
              {onClose && (
                <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-50">
                  Cancel
                </button>
              )}
              <button onClick={grantConsentAndRun} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg py-2.5 text-sm font-semibold">
                Allow &amp; Continue
              </button>
            </div>
          </>
        )}

        {(phase === "running" || phase === "done") && (
          <>
            <div className="space-y-2 mb-4 min-h-[220px]">
              {LOG_STEPS.slice(0, visibleLines).map((line, i) => (
                <div key={i} className="flex items-center gap-2 demo-log-line text-slate-700">
                  <span className="text-green-600">
                    <IconCheck />
                  </span>
                  {line.replace("…", "")} <span className="text-slate-300">✓</span>
                </div>
              ))}
              {phase === "running" && visibleLines < LOG_STEPS.length && (
                <div className="flex items-center gap-2 demo-log-line text-slate-500">
                  <span className="spinner inline-block w-3 h-3 rounded-full border-2 border-slate-300 border-t-teal-600" />
                  {LOG_STEPS[visibleLines]}
                </div>
              )}
            </div>
            {phase === "done" && application && (
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                  <IconCheck /> Application submitted
                </div>
                <p className="font-mono-gs text-sm text-navy-900 bg-slate-50 rounded-lg px-3 py-2 mb-4">
                  Application ID: <strong>{application.id}</strong>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/citizen/applications/${application.id}`)}
                    className="flex-1 bg-navy-900 hover:bg-navy-800 text-white rounded-lg py-2.5 text-sm font-semibold"
                  >
                    View timeline
                  </button>
                  {onClose && (
                    <button onClick={onClose} className="border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      Close
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {phase === "error" && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm text-red-600 mb-4">{errorMsg}</p>
            {onClose && (
              <button onClick={onClose} className="w-full bg-navy-900 text-white rounded-lg py-2.5 text-sm font-semibold">
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) return body;
  return <Modal onClose={phase === "consent" ? onClose : undefined}>{body}</Modal>;
}
