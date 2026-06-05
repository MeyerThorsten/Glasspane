"use client";

import { useMemo, useState } from "react";
import WidgetShell from "@/components/widgets/WidgetShell";
import { useCustomer } from "@/lib/customer-context";
import {
  PUBLIC_ROLE_WIDGETS,
  PUBLIC_WIDGET_CATALOG,
  encodeTransparencyShareToken,
  type PublicAudienceRole,
} from "@/lib/transparency-share";

const ROLE_OPTIONS: Array<{ value: PublicAudienceRole; label: string }> = [
  { value: "executive", label: "Executive" },
  { value: "operations", label: "Operations" },
  { value: "service", label: "Service" },
];

function getDefaultWidgets(role: PublicAudienceRole) {
  return PUBLIC_ROLE_WIDGETS[role].slice(0, 4);
}

export default function TransparencySharing() {
  const { customer } = useCustomer();
  const [role, setRole] = useState<PublicAudienceRole>("executive");
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(() => getDefaultWidgets("executive"));
  const [copied, setCopied] = useState(false);
  const allowedWidgets = useMemo(() => new Set(PUBLIC_ROLE_WIDGETS[role]), [role]);

  const shareLink = useMemo(() => {
    if (!customer || typeof window === "undefined") {
      return "";
    }

    const token = encodeTransparencyShareToken({
      version: 1,
      customerId: customer.id,
      audience: role,
      widgets: selectedWidgets.filter((id) => allowedWidgets.has(id)),
      createdAt: new Date().toISOString(),
    });

    return `${window.location.origin}/transparency/${token}`;
  }, [allowedWidgets, customer, role, selectedWidgets]);

  function handleRoleChange(nextRole: PublicAudienceRole) {
    setRole(nextRole);
    setSelectedWidgets((current) => {
      const allowed = new Set(PUBLIC_ROLE_WIDGETS[nextRole]);
      const stillAllowed = current.filter((id) => allowed.has(id));
      return stillAllowed.length > 0 ? stillAllowed : getDefaultWidgets(nextRole);
    });
    setCopied(false);
  }

  function toggleWidget(id: string) {
    setSelectedWidgets((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    setCopied(false);
  }

  async function copyLink() {
    if (!shareLink) {
      return;
    }

    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
  }

  if (!customer) {
    return null;
  }

  return (
    <WidgetShell title="Public Transparency Sharing" size="full">
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="public-role">
              Audience
            </label>
            <select
              id="public-role"
              value={role}
              onChange={(event) => handleRoleChange(event.target.value as PublicAudienceRole)}
              className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-magenta dark:border-[#2E2E3D] dark:bg-[#1C1C27] dark:text-gray-100"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Widgets</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PUBLIC_WIDGET_CATALOG.map((widget) => {
                const allowed = allowedWidgets.has(widget.id);
                const checked = selectedWidgets.includes(widget.id) && allowed;
                return (
                  <label
                    key={widget.id}
                    className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                      allowed
                        ? "border-gray-200 text-gray-700 dark:border-[#2E2E3D] dark:text-gray-300"
                        : "border-gray-100 text-gray-300 dark:border-[#252533] dark:text-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!allowed}
                      onChange={() => toggleWidget(widget.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-magenta focus:ring-magenta"
                    />
                    <span>{widget.title}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-[#2E2E3D] dark:bg-[#262633] md:flex-row md:items-center">
          <code className="min-w-0 flex-1 truncate text-xs text-gray-600 dark:text-gray-300">
            {shareLink}
          </code>
          <button
            type="button"
            onClick={copyLink}
            className="shrink-0 rounded-lg bg-magenta px-3 py-2 text-xs font-medium text-white hover:bg-magenta-hover"
          >
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}
