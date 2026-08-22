"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireRole } from "@/components/require-role";
import { CitizenShell } from "@/components/shells";
import { Pill, IconSearch, IconHub } from "@/components/ui";
import { api } from "@/lib/api";
import type { Service } from "@/lib/types";

function ServiceCard({ s }: { s: Service }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col hover:border-teal-400 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <Pill text={s.category || ""} />
        {s.integrated ? (
          <span className="text-[11px] font-semibold text-teal-600 flex items-center gap-1">
            <IconHub /> Integrated
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">Manual</span>
        )}
      </div>
      <p className="font-display font-semibold text-navy-900 mb-1">{s.name}</p>
      <p className="text-xs text-slate-400 mb-3">{s.department}</p>
      <p className="text-sm text-slate-500 mb-4 flex-1">{s.eligibility}</p>
      <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
        <span>⏱ {s.processing_time}</span>
      </div>
      <Link href={`/citizen/services/${s.id}`} className="text-center bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold rounded-lg py-2.5">
        View &amp; Apply
      </Link>
    </div>
  );
}

function ServicesBody() {
  const [services, setServices] = useState<Service[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    api.get<Service[]>("/api/services").then(setServices).catch(() => {});
  }, []);

  const categories = ["All", ...Array.from(new Set(services.map((s) => s.category || "")))];
  const filtered = services.filter(
    (s) => (category === "All" || s.category === category) && (s.name.toLowerCase().includes(query.toLowerCase()) || (s.department || "").toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Government Services</h1>
      <p className="text-slate-500 text-sm mb-6">Browse services across departments. Integrated services reuse your verified data automatically.</p>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <IconSearch />
          </span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search services…" className="w-full pl-9" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-56">
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 && <div className="col-span-full text-center text-slate-400 py-16">No services match your search.</div>}
        {filtered.map((s) => (
          <ServiceCard key={s.id} s={s} />
        ))}
      </div>
    </>
  );
}

export default function ServicesPage() {
  return (
    <RequireRole role="citizen">
      <CitizenShell active="services">
        <ServicesBody />
      </CitizenShell>
    </RequireRole>
  );
}
