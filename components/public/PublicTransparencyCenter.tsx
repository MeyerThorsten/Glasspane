"use client";

import { CustomerProvider } from "@/lib/customer-context";
import PoweredByFooter from "@/components/layout/PoweredByFooter";
import { getWidgetElement } from "@/config/widget-registry";
import type { PublicTransparencyShare, PublicWidgetOption } from "@/lib/transparency-share";
import type { WidgetSize } from "@/types";

const sizeClasses: Record<WidgetSize, string> = {
  small: "widget-small",
  medium: "widget-medium",
  large: "widget-large",
  full: "widget-full",
};

function PublicWidget({ widget }: { widget: PublicWidgetOption }) {
  return (
    <section className={`${sizeClasses[widget.size]} bg-white dark:bg-[#1C1C27] rounded-xl border border-gray-200 dark:border-[#2E2E3D] shadow-sm overflow-hidden`}>
      <div className="px-5 py-4 border-b border-gray-100 dark:border-[#2E2E3D]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{widget.title}</h2>
          <span className="text-[10px] font-medium uppercase text-gray-400 dark:text-gray-500">
            Read only
          </span>
        </div>
      </div>
      <div className="p-5 min-h-[100px]">
        {getWidgetElement(widget.id, `public-${widget.id}`)}
      </div>
    </section>
  );
}

export default function PublicTransparencyCenter({
  share,
  widgets,
}: {
  share: PublicTransparencyShare;
  widgets: PublicWidgetOption[];
}) {
  return (
    <CustomerProvider initialCustomerId={share.customerId}>
      <main className="min-h-screen bg-gray-50 dark:bg-[#111118]">
        <header className="border-b border-gray-200 bg-white px-6 py-5 dark:border-[#2E2E3D] dark:bg-[#1C1C27]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-magenta">Glasspane</p>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Transparency Center
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="rounded-md border border-gray-200 px-2 py-1 capitalize dark:border-[#2E2E3D]">
                {share.audience}
              </span>
              <span className="rounded-md border border-gray-200 px-2 py-1 dark:border-[#2E2E3D]">
                SLA target 99.999%
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-6">
          {widgets.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-[#2E2E3D] dark:bg-[#1C1C27] dark:text-gray-400">
              This link does not expose any public widgets.
            </div>
          ) : (
            <div className="widget-grid">
              {widgets.map((widget) => (
                <PublicWidget key={widget.id} widget={widget} />
              ))}
            </div>
          )}
        </div>
        <PoweredByFooter />
      </main>
    </CustomerProvider>
  );
}
