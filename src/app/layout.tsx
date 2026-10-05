import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

// Di-host sendiri oleh next/font (diunduh saat build): konsisten di semua HP
// dan tetap tersedia offline. Angka tabular dipakai untuk HM/BBM/jumlah.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "My PASKAM", template: "%s · My PASKAM" },
  description: "Aplikasi operasional PASKAM",
};

export const viewport: Viewport = {
  // Konten boleh sampai tepi layar iPhone; area aman diatur lewat env(safe-area-inset-*).
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e4fa3",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
