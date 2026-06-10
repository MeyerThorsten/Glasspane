"use client";

import { useCustomer } from "@/lib/customer-context";
import { useEffect, useState } from "react";
import { getCurrentSla } from "@/lib/services/kpi-service";
import { getComputedZeroOutageScore } from "@/lib/services/zero-outage-service";
import { ZeroOutageScore } from "@/types";
import { RiShieldCheckLine } from "@remixicon/react";

export default function ZeroOutageBanner() {
  const { customer } = useCustomer();
  const [sla, setSla] = useState<number | null>(null);
  const [score, setScore] = useState<ZeroOutageScore | null>(null);

  useEffect(() => {
    if (!customer) return;
    getCurrentSla(customer.id).then(setSla);
    getComputedZeroOutageScore(customer.id).then(setScore);
  }, [customer]);

  const target = 99.999;
  const meetsTarget = sla !== null && sla >= target;

  return (
    <div className="rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#3730A3] text-white p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left: Program title + shield */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
            <RiShieldCheckLine className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Zero Outage Program</h2>
            <p className="text-sm text-white/80">People &middot; Processes &middot; Platforms</p>
          </div>
        </div>

        {/* Center: SLA target */}
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">Availability Target</p>
          <p className="text-3xl font-extrabold tracking-tight">99.999%</p>
        </div>

        {/* Right: Live metrics */}
        <div className="flex items-center gap-8">
          {sla !== null && (
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">Current SLA</p>
              <p className="text-2xl font-bold">
                {sla.toFixed(3)}%
              </p>
              <p className={`text-xs font-medium ${meetsTarget ? "text-emerald-300" : "text-amber-300"}`}>
                {meetsTarget ? "Target met" : "Below target"}
              </p>
            </div>
          )}
          {score && (
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">Zero Outage Score</p>
              <p className="text-2xl font-bold">
                {score.overall}
                <span className="text-sm font-normal text-white/60"> / {score.target}</span>
              </p>
              <p className={`text-xs font-medium ${score.overall >= score.target ? "text-emerald-300" : "text-amber-300"}`}>
                {score.overall >= score.target ? "On target" : `${(score.target - score.overall).toFixed(1)} pts below`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
