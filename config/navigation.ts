import {
  RiDashboardLine,
  RiBarChartBoxLine,
  RiShieldCheckLine,
  RiSettings3Line,
  RiFileList3Line,
  RiTeamLine,
} from "@remixicon/react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: RiDashboardLine },
  { label: "Reports", href: "/reports", icon: RiBarChartBoxLine },
  { label: "Compliance", href: "/compliance", icon: RiShieldCheckLine },
  { label: "Workforce", href: "/workforce", icon: RiTeamLine },
  { label: "Documentation", href: "/documentation", icon: RiFileList3Line },
  { label: "Settings", href: "/settings", icon: RiSettings3Line },
];
