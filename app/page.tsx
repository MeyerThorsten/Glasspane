import Link from "next/link";
import {
  RiShieldCheckLine,
  RiDashboardLine,
  RiUserSettingsLine,
  RiMoneyEuroCircleLine,
  RiAlarmWarningLine,
  RiLineChartLine,
  RiBarChartGroupedLine,
  RiServerLine,
  RiArrowRightLine,
  RiArrowDownLine,
  RiBarChartBoxLine,
  RiSettings3Line,
  RiSparklingLine,
  RiChat3Line,
  RiRadarLine,
  RiBrainLine,
  RiErrorWarningLine,
  RiPulseLine,
  RiExchangeFundsLine,
  RiDatabaseLine,
  RiGitBranchLine,
  RiCodeSSlashLine,
  RiOpenSourceLine,
  RiGithubLine,
  RiSwitchLine,
} from "@remixicon/react";

const platformFeatures = [
  {
    icon: RiDashboardLine,
    title: "Real-Time Monitoring",
    description:
      "Live service status, latency tracking, and resource utilization at a glance.",
  },
  {
    icon: RiUserSettingsLine,
    title: "Multi-View Dashboard",
    description:
      "C-Level, Business, and Technical dashboards tailored to each audience.",
  },
  {
    icon: RiShieldCheckLine,
    title: "SLA Tracking",
    description:
      "99.999% availability target with real-time SLA compliance gauges and trend analysis.",
  },
  {
    icon: RiMoneyEuroCircleLine,
    title: "Cost Management",
    description:
      "Budget vs. actual spending, month-over-month trends, and per-service breakdown.",
  },
];

const aiFeatures = [
  {
    icon: RiSparklingLine,
    title: "AI-Powered Summaries",
    description:
      "Natural-language dashboard summaries tailored to your role — C-level, business, or technical.",
  },
  {
    icon: RiChat3Line,
    title: "Streaming Chat Assistant",
    description:
      "Ask questions in plain English and get real-time streamed answers via Server-Sent Events.",
  },
  {
    icon: RiRadarLine,
    title: "Anomaly Detection",
    description:
      "AI automatically flags unusual metric patterns — CPU spikes, latency trends, error rate surges.",
  },
  {
    icon: RiBrainLine,
    title: "Predictive Insights",
    description:
      "Forecasts SLA risks, cost overruns, and capacity thresholds before they become problems.",
  },
  {
    icon: RiErrorWarningLine,
    title: "Risk Briefing",
    description:
      "AI-generated threat assessments with severity levels, affected services, and recommended actions.",
  },
  {
    icon: RiPulseLine,
    title: "SLA Risk Advisor",
    description:
      "Predicts SLA breach probability with trend analysis and proactive mitigation recommendations.",
  },
  {
    icon: RiExchangeFundsLine,
    title: "Cost Forecast",
    description:
      "AI-driven spending trajectory analysis with trend charts and budget impact projections.",
  },
  {
    icon: RiDatabaseLine,
    title: "Capacity Planner",
    description:
      "Resource utilization predictions that flag capacity thresholds before they become critical.",
  },
  {
    icon: RiGitBranchLine,
    title: "Root Cause Patterns",
    description:
      "Incident pattern analysis that identifies systemic issues across your infrastructure.",
  },
  {
    icon: RiCodeSSlashLine,
    title: "Change Impact",
    description:
      "Deployment risk assessment that evaluates how changes affect service stability.",
  },
];

const providers = [
  "OpenAI",
  "Anthropic",
  "Google Gemini",
  "IBM watsonx",
  "OpenRouter",
  "AWS Bedrock",
  "Ollama",
  "LM Studio",
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

const pages = [
  {
    icon: RiBarChartBoxLine,
    title: "Reports",
    description:
      "SLA performance history, incident summaries, cost breakdowns, and ticket trends — all the data you'd review monthly or export for stakeholders.",
    highlights: ["SLA Trend Analysis", "Incident Summary Table", "Cost vs Budget", "Ticket Volume Charts"],
    href: "/reports",
  },
  {
    icon: RiShieldCheckLine,
    title: "Compliance",
    description:
      "Security posture scoring, patch compliance rates, certificate expiry tracking, and backup health — your compliance status at a glance.",
    highlights: ["Security Score & CVEs", "Patch Compliance Rates", "Certificate Expiry", "Backup Success Rates"],
    href: "/compliance",
  },
  {
    icon: RiSettings3Line,
    title: "Settings",
    description:
      "Personalise your portal experience with theme preferences, view your customer profile, and manage notification settings.",
    highlights: ["Light / Dark Theme", "Customer Profile", "Notification Preferences"],
    href: "/settings",
  },
];

const stats = [
  { value: "99.999%", label: "Availability Target" },
  { value: "8", label: "AI Providers" },
  { value: "14", label: "AI Features" },
  { value: "3", label: "Role-Based Views" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#111118]">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#4F46E5] to-[#312E81] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Copy */}
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
                Your End-to-End Digital Health Dashboard
              </p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Glasspane
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/80">
                AI-powered infrastructure transparency for managed service
                providers. Real-time monitoring, anomaly detection, and
                predictive insights — designed for executives, operations,
                and engineering teams.
              </p>
              <a
                href="https://thorstenmeyerai.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
              >
                <RiSparklingLine className="h-3.5 w-3.5" />
                Powered by Thorsten Meyer AI
              </a>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/dashboard?view=c-level"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#4F46E5] shadow-lg transition hover:bg-white/90"
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
                    glasspane / dashboard
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

      {/* ── Platform Features ───────────────────────────────── */}
      <section id="features" className="bg-gray-50 dark:bg-[#111118] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              Everything you need for service transparency
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              A single portal for availability, security, cost, and operational
              insights — built on Zero Outage standards.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-200 dark:border-[#2E2E3D] bg-white dark:bg-[#1C1C27] p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-magenta-50 dark:bg-[#1e1b4b] text-magenta">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI-Powered Intelligence ─────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              AI-powered intelligence
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              10 AI features that turn raw infrastructure data into actionable
              insights — from natural language chat to predictive risk analysis.
            </p>
            <a
              href="https://thorstenmeyerai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-4 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-100 dark:hover:bg-indigo-950/50"
            >
              <RiSparklingLine className="h-3.5 w-3.5" />
              Powered by Thorsten Meyer AI — supports 8 providers including OpenAI, Anthropic, Gemini, and more
            </a>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {aiFeatures.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-200 dark:border-[#2E2E3D] bg-white dark:bg-[#1C1C27] p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-[#1e1b4b] text-indigo-600 dark:text-indigo-400">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Providers ─────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-[#111118] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              No vendor lock-in
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Choose the right AI model for each task. Assign different providers
              per feature, with automatic fallback chains if one goes down.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {providers.map((name) => (
              <div
                key={name}
                className="rounded-lg border border-gray-200 dark:border-[#2E2E3D] bg-white dark:bg-[#1C1C27] px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm"
              >
                {name}
              </div>
            ))}
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-[#1e1b4b] text-indigo-600 dark:text-indigo-400">
                <RiSwitchLine className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Per-Task Assignment</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use Gemini for summaries, Anthropic for chat, OpenAI for risk analysis — one env var each.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-[#1e1b4b] text-indigo-600 dark:text-indigo-400">
                <RiShieldCheckLine className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Automatic Fallback</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Define fallback chains per task. If the primary provider fails, the next one takes over transparently.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-[#1e1b4b] text-indigo-600 dark:text-indigo-400">
                <RiServerLine className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Local Models</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Run Ollama or LM Studio for full data sovereignty — your infrastructure data never leaves your network.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── View Showcases ───────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              Three views, one portal
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Every stakeholder sees the data that matters most to them.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {views.map((v) => (
              <div
                key={v.title}
                className="flex flex-col rounded-xl border border-gray-200 dark:border-[#2E2E3D] bg-white dark:bg-[#1C1C27] p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-magenta-50 dark:bg-[#1e1b4b] text-magenta">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {v.title}
                </h3>
                <p className="text-sm font-medium text-magenta">{v.subtitle}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {v.description}
                </p>
                <ul className="mt-4 space-y-1">
                  {v.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
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

      {/* ── Portal Pages ──────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-[#111118] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              Beyond the dashboard
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Dedicated pages for reports, compliance tracking, and personalisation.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pages.map((p) => (
              <div
                key={p.title}
                className="flex flex-col rounded-xl border border-gray-200 dark:border-[#2E2E3D] bg-white dark:bg-[#1C1C27] p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-magenta-50 dark:bg-[#1e1b4b] text-magenta">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {p.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {p.description}
                </p>
                <ul className="mt-4 space-y-1">
                  {p.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-magenta transition hover:text-magenta-hover"
                >
                  Open {p.title}
                  <RiArrowRightLine className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#4F46E5] to-[#312E81] py-14">
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

      {/* ── Open Source ──────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#1C1C27] text-gray-700 dark:text-gray-300">
              <RiOpenSourceLine className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              Open source. Fully transparent.
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              A transparency tool should itself be transparent. Glasspane is
              licensed under AGPL-3.0 — inspect every line of code, self-host on
              your own infrastructure, or contribute improvements back.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/MeyerThorsten/Glasspane"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-gray-900 shadow-lg transition hover:bg-gray-800 dark:hover:bg-gray-100"
              >
                <RiGithubLine className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-[#111118] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Ready to see your services?
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Explore the live dashboard with 14 AI-powered features, 8 provider
            options, and three role-based views — fully open source.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard?view=c-level"
              className="inline-flex items-center gap-2 rounded-lg bg-magenta px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-magenta-hover"
            >
              Launch Demo
              <RiArrowRightLine className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/MeyerThorsten/Glasspane"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-[#2E2E3D] bg-white dark:bg-[#1C1C27] px-8 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-[#252533]"
            >
              <RiGithubLine className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 dark:border-[#2E2E3D] bg-gray-50 dark:bg-[#111118] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-center text-sm text-gray-400 dark:text-gray-500">
          <span className="text-xl font-bold text-gray-600 dark:text-gray-300">Glasspane</span>
          <div className="flex items-center gap-4">
            <p>&copy; {new Date().getFullYear()} Thorsten Meyer</p>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <a
              href="https://github.com/MeyerThorsten/Glasspane"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-gray-600 dark:hover:text-gray-300"
            >
              <RiGithubLine className="h-4 w-4" />
              GitHub
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>AGPL-3.0</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
