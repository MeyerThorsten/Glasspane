import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T-Systems Transparency Dashboard",
  description:
    "T-Systems Transparency Portal — Zero Outage Program, real-time service monitoring, and role-based dashboards for 99.999% availability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
