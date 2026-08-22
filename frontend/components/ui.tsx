"use client";

import Link from "next/link";
import { ReactNode } from "react";

export function fmtDT(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function fmtD(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
export function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function badgeTone(status: string) {
  const s = (status || "").toLowerCase();
  if (["approved", "connected", "healthy", "success", "active", "granted", "resolved", "done", "verified", "on track"].some((k) => s.includes(k)))
    return { bg: "bg-green-100", text: "text-green-600" };
  if (["warning", "pending", "under review", "submitted", "queued", "review", "ongoing"].some((k) => s.includes(k)))
    return { bg: "bg-amber-100", text: "text-amber-600" };
  if (["failed", "rejected", "breach", "error", "down", "revoked", "expired"].some((k) => s.includes(k)))
    return { bg: "bg-red-100", text: "text-red-600" };
  return { bg: "bg-slate-100", text: "text-slate-600" };
}

export function Badge({ status }: { status: string }) {
  const t = badgeTone(status);
  return (
    <span className={`badge ${t.bg} ${t.text}`}>
      <span className="dot" />
      {status}
    </span>
  );
}

export function Pill({ text, tone = "bg-navy-900/5 text-navy-900" }: { text: string; tone?: string }) {
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tone}`}>{text}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border border-slate-200 rounded-xl ${className}`}>{children}</div>;
}

export function StatCard({ label, value, tone = "text-navy-900" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-xs font-medium text-slate-500 mb-2">{label}</p>
      <p className={`text-3xl font-display font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export function Brand({ size = "text-lg", light = false }: { size?: string; light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-md bg-navy-900 flex items-center justify-center text-teal-400">
        <IconHub />
      </div>
      <span className={`font-display font-bold ${size} ${light ? "text-white" : "text-navy-900"}`}>GovSync</span>
    </div>
  );
}

export function IconHub() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <circle cx="4" cy="4" r="2" />
      <circle cx="20" cy="4" r="2" />
      <circle cx="4" cy="20" r="2" />
      <circle cx="20" cy="20" r="2" />
      <path d="M6 5.5 10 10M18 5.5 14 10M6 18.5 10 14M18 18.5 14 14" />
    </svg>
  );
}
export function IconDoc() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 2h9l5 5v15H6z" />
      <path d="M15 2v5h5" />
    </svg>
  );
}
export function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  );
}
export function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
export function IconClock({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
export function IconDash({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
export function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
export function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2 4 5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V5z" />
    </svg>
  );
}

export function TimelineItem({ step, system, status, timestamp, duration }: { step: string; system: string; status: string; timestamp: string | null; duration: string | null }) {
  const tone = status === "done" ? { bg: "bg-green-600", text: "text-white" } : status === "active" ? { bg: "bg-amber-500", text: "text-white" } : { bg: "bg-slate-200", text: "text-slate-400" };
  const icon = status === "done" ? <IconCheck /> : status === "active" ? <IconClock /> : <IconDash />;
  return (
    <div className="tl-item">
      <div className={`tl-dot ${tone.bg} ${tone.text}`}>{icon}</div>
      <p className="text-sm font-semibold text-navy-900">{step}</p>
      <p className="text-xs text-slate-400">
        {system}
        {timestamp ? ` · ${fmtDT(timestamp)}` : ""}
        {duration && duration !== "—" ? ` · ${duration}` : ""}
      </p>
    </div>
  );
}

export function ArchDiagram({ steps }: { steps: string[] }) {
  return (
    <div className="p-6 flex flex-col items-center gap-2 font-mono-gs text-xs text-slate-500 text-center">
      {steps.map((s, i) => (
        <div key={s} className="contents">
          <div className={i === Math.floor(steps.length / 2) ? "bg-navy-900 text-white rounded-lg px-5 py-2.5 font-semibold" : "bg-white border border-slate-200 rounded-lg px-5 py-2.5"}>
            {s}
          </div>
          {i < steps.length - 1 && <div className="text-teal-600">↓</div>}
        </div>
      ))}
    </div>
  );
}

export function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link href={href} className={`topnav-link ${active ? "active" : ""}`}>
      {children}
    </Link>
  );
}
