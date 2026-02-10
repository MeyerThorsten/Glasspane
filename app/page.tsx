import Link from "next/link";
import {
  RiShieldCheckLine,
  RiDashboardLine,
  RiUserSettingsLine,
  RiLockLine,
  RiMoneyEuroCircleLine,
  RiAlarmWarningLine,
  RiLineChartLine,
  RiBarChartGroupedLine,
  RiServerLine,
  RiArrowRightLine,
  RiArrowDownLine,
} from "@remixicon/react";

const features = [
  {
    icon: RiShieldCheckLine,
    title: "Zero Outage Program",
    description:
      "99.999% availability target built on the three pillars: People, Processes, and Platforms.",
  },
  {
    icon: RiDashboardLine,
    title: "Real-Time Monitoring",
    description:
      "Live service status, latency tracking, and resource utilization at a glance.",
  },
  {
    icon: RiUserSettingsLine,
    title: "Role-Based Views",
    description:
      "C-Level, Business, and Technical dashboards tailored to each audience.",
  },
  {
    icon: RiLockLine,
    title: "Security & Compliance",
    description:
      "Vulnerability tracking, patch compliance, and certificate management.",
  },
  {
    icon: RiMoneyEuroCircleLine,
    title: "Cost Transparency",
    description:
      "Budget vs. actual spending, month-over-month trends, and per-service breakdown.",
  },
  {
    icon: RiAlarmWarningLine,
    title: "Incident Management",
    description:
      "MTTR trends, severity tracking, and change management in one place.",
  },
];

const views = [
  {
    icon: RiLineChartLine,
    title: "C-Level",
    subtitle: "Executive Overview",
    description:
      "High-level KPIs, SLA gauges, risk overview, and strategic cost metrics designed for leadership.",
    highlights: ["SLA Compliance Gauges", "Risk Heatmap", "Budget Overview"],
    query: "c-level",
  },
  {
    icon: RiBarChartGroupedLine,
    title: "Business",
    subtitle: "Operational Metrics",
    description:
      "Ticket volumes, project delivery status, change success rates, and operational performance.",
    highlights: ["Ticket Analytics", "Project Delivery", "Change Success Rate"],
    query: "business",
  },
  {
    icon: RiServerLine,
    title: "Technical",
    subtitle: "System Health",
    description:
      "System status, latency monitoring, vulnerability scans, and infrastructure utilization.",
    highlights: ["Service Status Map", "Latency Metrics", "Vulnerability Scans"],
    query: "technical",
  },
];

const stats = [
  { value: "99.999%", label: "Availability Target" },
  { value: "31", label: "Dashboard Widgets" },
  { value: "3", label: "Role-Based Views" },
  { value: "24/7", label: "Real-Time Monitoring" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#E20074] to-[#5A0030] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Copy */}
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
                T-Systems
              </p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Transparency Portal
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/80">
                Zero Outage Program. 99.999% availability. Real-time service
                monitoring across every layer of your infrastructure — designed
                for executives, operations, and engineering teams.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/dashboard?view=c-level"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#E20074] shadow-lg transition hover:bg-white/90"
                >
                  Explore Dashboard
                  <RiArrowRightLine className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Learn More
                  <RiArrowDownLine className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Stylized dashboard preview */}
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-white/40">
                    transparency-portal / dashboard
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {/* Mini KPI cards */}
                  {["99.98%", "1.2 ms", "847"].map((val, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-white/10 p-3 text-center"
                    >
                      <p className="text-lg font-bold">{val}</p>
                      <p className="text-[10px] text-white/50">
                        {["SLA", "Latency", "Tickets"][i]}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white/10 p-3">
                    <div className="mb-2 text-[10px] text-white/50">
                      Availability
                    </div>
                    <div className="flex items-end gap-1">
                      {[40, 65, 55, 80, 70, 90, 85].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-white/30"
                          style={{ height: `${h}%`, minHeight: h * 0.6 }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3">
                    <div className="mb-2 text-[10px] text-white/50">
                      Risk Matrix
                    </div>
                    <div className="grid grid-cols-3 grid-rows-3 gap-1">
                      {[
                        "bg-green-500/40",
                        "bg-green-500/40",
                        "bg-yellow-500/40",
                        "bg-green-500/40",
                        "bg-yellow-500/40",
                        "bg-orange-500/40",
                        "bg-yellow-500/40",
                        "bg-orange-500/40",
                        "bg-red-500/40",
                      ].map((color, i) => (
                        <div
                          key={i}
                          className={`aspect-square rounded-sm ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────── */}
      <section id="features" className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for service transparency
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              A single portal for availability, security, cost, and operational
              insights — built on T-Systems Zero Outage standards.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-magenta-50 text-magenta">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── View Showcases ───────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Three views, one portal
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Every stakeholder sees the data that matters most to them.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {views.map((v) => (
              <div
                key={v.title}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-magenta-50 text-magenta">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {v.title}
                </h3>
                <p className="text-sm font-medium text-magenta">{v.subtitle}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-500">
                  {v.description}
                </p>
                <ul className="mt-4 space-y-1">
                  {v.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/dashboard?view=${v.query}`}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-magenta transition hover:text-magenta-hover"
                >
                  View Dashboard
                  <RiArrowRightLine className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#E20074] to-[#5A0030] py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-white sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-sm font-medium text-white/70">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to see your services?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Explore the live dashboard demo with 31 widgets across three
            role-based views.
          </p>
          <Link
            href="/dashboard?view=c-level"
            className="mt-10 inline-flex items-center gap-2 rounded-lg bg-magenta px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-magenta-hover"
          >
            Launch Demo
            <RiArrowRightLine className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-gray-50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 text-center text-sm text-gray-400">
          <div className="flex items-center gap-2 font-semibold text-gray-600">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-magenta text-[10px] font-bold text-white">
              T
            </span>
            Transparency Portal
          </div>
          <p>&copy; {new Date().getFullYear()} T-Systems International GmbH</p>
        </div>
      </footer>
    </main>
  );
}
