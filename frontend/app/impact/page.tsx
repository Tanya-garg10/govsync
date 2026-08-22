"use client";

import Link from "next/link";
import { Brand, Card } from "@/components/ui";
import { AdminShell, OfficialShell } from "@/components/shells";
import { useAuth } from "@/lib/auth-context";

const ITEMS: [string, string, string][] = [
  ["Duplicate submissions", "↓ 67%", "red"],
  ["Average processing time", "↓ 42%", "amber"],
  ["Manual verification", "↓ 58%", "amber"],
  ["Cross-department coordination", "↑ 73%", "green"],
  ["SLA compliance", "↑ 31%", "green"],
];

function toneClass(tone: string) {
  if (tone === "green") return "text-green-600";
  if (tone === "red") return "text-red-500";
  return "text-amber-600";
}

function ImpactBody() {
  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Interoperability Impact</h1>
      <p className="text-amber-700 bg-amber-50 border border-amber-100 inline-block rounded-lg px-3 py-1.5 text-xs font-medium mb-6">
        Prototype simulation / projected impact — not real government statistics
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ITEMS.map(([l, v, tone]) => (
          <Card key={l}>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-2">{l}</p>
              <p className={`text-4xl font-display font-bold ${toneClass(tone)}`}>{v}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <div className="p-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            These figures illustrate the kind of measurable outcomes an interoperability layer like GovSync is designed to produce — fewer duplicate submissions
            because verified data is reused, faster processing because verification steps run automatically, and stronger cross-department coordination because
            every system shares one workflow and audit layer.
          </p>
        </div>
      </Card>
    </>
  );
}

export default function ImpactPage() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return (
      <AdminShell active="impact">
        <ImpactBody />
      </AdminShell>
    );
  }
  if (user?.role === "official") {
    return (
      <OfficialShell active="impact">
        <ImpactBody />
      </OfficialShell>
    );
  }
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Brand />
          </Link>
          <Link href="/login" className="text-sm font-semibold text-navy-900">
            Sign in →
          </Link>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <ImpactBody />
      </div>
    </div>
  );
}
