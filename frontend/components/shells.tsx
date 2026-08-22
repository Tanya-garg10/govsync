"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Brand, IconBell, IconHub, IconDash, IconDoc, IconClock, IconShield } from "./ui";
import type { NotificationItem } from "@/lib/types";

function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-400">
        <span>GovSync — Interoperability Middleware Prototype · Built for Smart India Hackathon</span>
        <span className="font-mono-gs">DEMO DATA · All records are fictional</span>
      </div>
    </footer>
  );
}

const CITIZEN_NAV: [string, string, string][] = [
  ["dashboard", "Dashboard", "/citizen/dashboard"],
  ["services", "Services", "/citizen/services"],
  ["applications", "Applications", "/citizen/applications"],
  ["documents", "Documents", "/citizen/documents"],
  ["grievances", "Grievances", "/citizen/grievances"],
  ["consents", "My Consents", "/citizen/consents"],
];

export function CitizenShell({ active, children }: { active: string; children: ReactNode }) {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user?.citizen_id) return;
    api
      .get<NotificationItem[]>(`/api/notifications?citizen_id=${user.citizen_id}`)
      .then((list) => setUnread(list.filter((n) => !n.read).length))
      .catch(() => {});
  }, [user?.citizen_id]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/citizen/dashboard">
              <Brand />
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              {CITIZEN_NAV.map(([k, l, h]) => (
                <Link key={k} href={h} className={`topnav-link ${active === k ? "active" : ""}`}>
                  {l}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/citizen/notifications" className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500">
              <IconBell />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center">{unread}</span>
              )}
            </Link>
            <Link href="/citizen/profile" className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white text-xs font-semibold flex items-center justify-center">
                {(user?.name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">{user?.name?.split(" ")[0]}</span>
            </Link>
            <button onClick={logout} className="hidden sm:block text-xs text-slate-400 hover:text-red-600">
              Log out
            </button>
          </div>
        </div>
        <nav className="lg:hidden flex overflow-x-auto gap-1 px-4 pb-2">
          {CITIZEN_NAV.map(([k, l, h]) => (
            <Link key={k} href={h} className={`topnav-link whitespace-nowrap ${active === k ? "active" : ""}`}>
              {l}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">{children}</main>
      <Footer />
    </div>
  );
}

const OFFICIAL_NAV: [string, string, string, ReactNode][] = [
  ["dashboard", "Department Dashboard", "/official/dashboard", <IconDash key="1" />],
  ["grievances", "Grievances", "/official/grievances", <IconBell key="2" />],
  ["sla", "SLA Compliance", "/official/sla", <IconClock key="3" />],
];

const ADMIN_NAV: [string, string, string, ReactNode][] = [
  ["hub", "Integration Hub", "/admin/hub", <IconHub key="1" />],
  ["monitoring", "API Monitoring", "/admin/monitoring", <IconDash key="2" />],
  ["datamodel", "Common Data Model", "/admin/datamodel", <IconDoc key="3" />],
  ["masterdata", "Master Data", "/admin/masterdata", <IconDoc key="4" />],
  ["workflows", "Workflow Orchestration", "/admin/workflows", <IconDash key="5" />],
  ["connectors", "System Connectors", "/admin/connectors", <IconHub key="6" />],
  ["audit", "Audit & Compliance", "/admin/audit", <IconShield key="7" />],
  ["dataquality", "Data Quality", "/admin/dataquality", <IconCheckIcon key="8" />],
  ["exceptions", "Integration Exceptions", "/admin/exceptions", <IconClock key="9" />],
  ["health", "System Health", "/admin/health", <IconDash key="10" />],
  ["sla", "SLA Compliance", "/admin/sla", <IconClock key="11" />],
  ["users", "Users & Roles", "/admin/users", <IconShield key="12" />],
];

function IconCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function DashShell({
  roleKey,
  navItems,
  active,
  children,
  roleLabel,
  sub,
}: {
  roleKey: "official" | "admin";
  navItems: [string, string, string, ReactNode][];
  active: string;
  children: ReactNode;
  roleLabel: string;
  sub: string;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const homeHref = roleKey === "admin" ? "/admin/hub" : "/official/dashboard";

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-64 bg-navy-900 text-white shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-white/10">
          <Link href={homeHref}>
            <Brand size="text-base" light />
          </Link>
        </div>
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs text-slate-400">{roleLabel}</p>
          <p className="text-sm font-medium">{sub}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(([k, l, h]) => (
            <Link key={k} href={h} className={`sidebar-link ${active === k ? "active" : ""}`}>
              {l}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <Link href="/impact" className="sidebar-link">
            Impact Summary
          </Link>
          <button onClick={logout} className="sidebar-link w-full text-left">
            Log out
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-30 bg-navy-900 text-white h-14 flex items-center justify-between px-4">
          <Brand size="text-base" light />
          <select
            onChange={(e) => router.push(e.target.value)}
            defaultValue={navItems.find(([k]) => k === active)?.[2]}
            className="bg-navy-800 text-white text-xs rounded-md border border-white/20 px-2 py-1"
          >
            {navItems.map(([k, l, h]) => (
              <option key={k} value={h}>
                {l}
              </option>
            ))}
          </select>
        </header>
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1400px] w-full mx-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export function OfficialShell({ active, children }: { active: string; children: ReactNode }) {
  const { user } = useAuth();
  return (
    <DashShell roleKey="official" navItems={OFFICIAL_NAV} active={active} roleLabel="Government Official" sub={user?.department || "Dept. of Education"}>
      {children}
    </DashShell>
  );
}

export function AdminShell({ active, children }: { active: string; children: ReactNode }) {
  return (
    <DashShell roleKey="admin" navItems={ADMIN_NAV} active={active} roleLabel="System Administrator" sub="Platform Administration">
      {children}
    </DashShell>
  );
}
