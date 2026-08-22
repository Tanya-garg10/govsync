import Link from "next/link";
import { Brand } from "@/components/ui";

function HeroHub() {
  const nodes: [number, number, string][] = [
    [70, 60, "Identity"],
    [350, 60, "Education"],
    [70, 280, "Income"],
    [350, 280, "Documents"],
  ];
  const paths = [
    "M70,60 C120,90 150,120 205,168",
    "M350,60 C300,90 270,120 215,168",
    "M70,280 C120,250 150,220 205,172",
    "M350,280 C300,250 270,220 215,172",
  ];
  return (
    <svg viewBox="0 0 420 340" className="w-full max-w-md mx-auto">
      <defs>
        {paths.map((d, i) => (
          <path key={i} id={`p${i}`} d={d} fill="none" />
        ))}
      </defs>
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="#1B4079" strokeWidth="1.5" fill="none" opacity={0.6} />
      ))}
      {paths.map((_, i) => (
        <circle key={i} r="4" fill="#5EEAD4">
          <animateMotion dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" begin={`${i * 0.4}s`}>
            <mpath href={`#p${i}`} />
          </animateMotion>
        </circle>
      ))}
      {nodes.map(([x, y, l]) => (
        <g key={l}>
          <rect x={x - 52} y={y - 24} width="104" height="48" rx="10" fill="#0F2545" stroke="#2A5698" />
          <text x={x} y={y + 5} textAnchor="middle" fill="#CBD5E1" fontSize="12" fontFamily="IBM Plex Mono">
            {l}
          </text>
        </g>
      ))}
      <circle cx="210" cy="170" r="34" fill="#0F9D8C" style={{ filter: "drop-shadow(0 0 14px rgba(15,157,140,.55))" }} />
      <text x="210" y="167" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="IBM Plex Sans">
        HUB
      </text>
      <text x="210" y="180" textAnchor="middle" fill="white" fontSize="8" fontFamily="IBM Plex Mono" opacity={0.85}>
        sync
      </text>
    </svg>
  );
}

const BENEFITS: [string, string][] = [
  ["Fewer duplicate submissions", "Citizens reuse verified data instead of re-entering it across portals."],
  ["Faster processing", "Automated verification collapses days of manual checks into seconds."],
  ["Better coordination", "Departments share status and evidence through one workflow layer."],
  ["Consistent records", "A common data model keeps every department reading the same facts."],
  ["Improved citizen experience", "One login, one tracker, one place to manage consent."],
  ["Stronger SLA compliance", "Bottlenecks are visible and measurable in real time."],
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      <header className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-2">
            <Link href="/demo" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 border border-teal-200 bg-teal-50 rounded-lg px-3 py-1.5 hover:bg-teal-100">
              ▶ Run Interoperability Demo
            </Link>
            <Link href="/login" className="text-sm font-semibold bg-navy-900 text-white rounded-lg px-4 py-2 hover:bg-navy-800">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(ellipse at top right, #122F5C, #081326 60%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="font-mono-gs text-xs tracking-widest text-teal-400 mb-5">GOVERNMENT INTEROPERABILITY PLATFORM · PROTOTYPE</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-6">
              One Citizen.
              <br />
              Connected Government Services.
            </h1>
            <p className="text-slate-300 text-lg max-w-xl mb-8">
              GovSync enables secure interoperability between fragmented government digital platforms through a unified integration layer — without replacing a single existing system.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/demo" className="bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg px-5 py-3 text-sm">
                ▶ Run Interoperability Demo
              </Link>
              <Link href="/login" className="bg-white/5 border border-white/20 text-white hover:bg-white/10 rounded-lg px-5 py-3 text-sm font-medium">
                Explore the platform
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10 text-slate-400 text-xs font-mono-gs">
              <span>6 connected systems</span>
              <span className="text-white/20">|</span>
              <span>1 integration hub</span>
              <span className="text-white/20">|</span>
              <span>0 replaced legacy systems</span>
            </div>
          </div>
          <div>
            <HeroHub />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-xs font-semibold tracking-widest text-red-600 mb-2">THE PROBLEM</p>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">Fragmented portals. Disconnected systems.</h2>
          <p className="text-slate-600 leading-relaxed">
            Citizens re-enter the same identity, income and education details into a dozen different portals. Departments can&apos;t see each other&apos;s verified data, applications stall for re-verification, and there&apos;s no single view of a citizen&apos;s interactions with government.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest text-teal-600 mb-2">THE SOLUTION</p>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">A secure interoperability middleware.</h2>
          <p className="text-slate-600 leading-relaxed">
            GovSync sits between citizens and government systems as an <strong>Integration Hub</strong> — normalizing data into a common model, brokering consent-based sharing, orchestrating workflows across departments, and giving every request a full audit trail. Existing systems keep running exactly as they are.
          </p>
        </div>
      </section>

      <section className="bg-sand-50 border-y border-slate-200 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold tracking-widest text-navy-700 mb-6">HOW IT CONNECTS</p>
          <div className="flex flex-col items-center gap-3 font-mono-gs text-sm text-slate-500">
            <div className="bg-white border border-slate-200 rounded-lg px-5 py-2.5 shadow-sm">Existing Government Systems</div>
            <div className="text-teal-600">↓</div>
            <div className="bg-navy-900 text-white rounded-lg px-5 py-2.5 shadow-sm font-semibold">GovSync Integration Hub</div>
            <div className="text-teal-600">↓</div>
            <div className="bg-white border border-slate-200 rounded-lg px-5 py-2.5 shadow-sm">Unified Citizen Services</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <p className="text-xs font-semibold tracking-widest text-navy-700 mb-6">BENEFITS</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map(([t, d]) => (
            <div key={t} className="border border-slate-200 rounded-xl p-5 bg-white">
              <p className="font-display font-semibold text-navy-900 mb-1.5">{t}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="font-display text-2xl font-bold text-white mb-3">See it work end-to-end</h3>
          <p className="text-slate-300 mb-8">
            Run a live simulated Student Scholarship application — from consent to identity verification, income and education checks, eligibility calculation, and department approval — powered entirely by the Integration Hub.
          </p>
          <Link href="/demo" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg px-6 py-3.5 text-sm">
            ▶ Run Interoperability Demo
          </Link>
        </div>
      </section>
    </div>
  );
}
