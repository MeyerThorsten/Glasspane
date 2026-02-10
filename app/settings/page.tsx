"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { useCustomer } from "@/lib/customer-context";
import WidgetShell from "@/components/widgets/WidgetShell";
import { RiSunLine, RiMoonLine } from "@remixicon/react";

function Appearance() {
  const { theme, toggleTheme } = useTheme();

  return (
    <WidgetShell title="Appearance" size="full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Switch between light and dark mode
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-[#2E2E3D] bg-gray-50 dark:bg-[#262633] hover:bg-gray-100 dark:hover:bg-[#2E2E3D] transition-colors"
        >
          {theme === "dark" ? (
            <>
              <RiMoonLine className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Dark</span>
            </>
          ) : (
            <>
              <RiSunLine className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Light</span>
            </>
          )}
        </button>
      </div>
    </WidgetShell>
  );
}

function Profile() {
  const { customer } = useCustomer();

  if (!customer) return null;

  const fields = [
    { label: "Company", value: customer.name },
    { label: "Industry", value: customer.industry },
    { label: "Tier", value: customer.tier },
    { label: "Contact", value: customer.contactEmail },
    { label: "Services", value: customer.subscribedCategories.join(", ") },
  ];

  return (
    <WidgetShell title="Profile" size="full">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-magenta/10 flex items-center justify-center">
            <span className="text-sm font-bold text-magenta">{customer.logoInitials}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{customer.tier}</p>
          </div>
        </div>
        {fields.map((field) => (
          <div key={field.label} className="flex items-start justify-between py-2 border-b border-gray-50 dark:border-[#1C1C27]">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{field.label}</span>
            <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{field.value}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

function Notifications() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [incidentNotifs, setIncidentNotifs] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);

  const toggles = [
    { label: "Email Alerts", description: "Receive email notifications for critical events", value: emailAlerts, onChange: setEmailAlerts },
    { label: "Incident Notifications", description: "Get notified when new incidents are created", value: incidentNotifs, onChange: setIncidentNotifs },
    { label: "Weekly Reports", description: "Receive a weekly summary report via email", value: weeklyReport, onChange: setWeeklyReport },
    { label: "Maintenance Alerts", description: "Get notified about upcoming maintenance windows", value: maintenanceAlerts, onChange: setMaintenanceAlerts },
  ];

  return (
    <WidgetShell title="Notifications" size="full">
      <div className="space-y-4">
        {toggles.map((toggle) => (
          <div key={toggle.label} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{toggle.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{toggle.description}</p>
            </div>
            <button
              onClick={() => toggle.onChange(!toggle.value)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                toggle.value ? "bg-magenta" : "bg-gray-300 dark:bg-[#2E2E3D]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  toggle.value ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Appearance />
      <Profile />
      <Notifications />
    </div>
  );
}
