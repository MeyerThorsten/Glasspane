import {
  RiDashboardLine,
  RiBarChartBoxLine,
  RiShieldCheckLine,
  RiSettings3Line,
} from "@remixicon/react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: RiDashboardLine },
  { label: "Reports", href: "#", icon: RiBarChartBoxLine },
  { label: "Compliance", href: "#", icon: RiShieldCheckLine },
  { label: "Settings", href: "#", icon: RiSettings3Line },
];
