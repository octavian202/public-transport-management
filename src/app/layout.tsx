import type { Metadata } from "next";

import { Inter } from "next/font/google";

import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OptiBus - Smart Bus Schedule Optimization",
  description:
    "Maximize efficiency, reduce costs, and improve passenger experience with data-driven bus scheduling that adapts to real-world demand patterns.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
