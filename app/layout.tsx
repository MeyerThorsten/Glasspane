import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T-Systems Transparency Dashboard",
  description: "Service transparency and monitoring portal for T-Systems customers",
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
