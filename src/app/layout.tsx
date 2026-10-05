import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { ServiceWorkerRegister } from "@/components/sw-register";

import "./globals.css";

// Di-host sendiri oleh next/font (diunduh saat build): konsisten di semua HP
// dan tetap tersedia offline. Angka tabular dipakai untuk HM/BBM/jumlah.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "My PASKAM", template: "%s · My PASKAM" },
  description: "Aplikasi operasional PASKAM",
  applicationName: "My PASKAM",
  appleWebApp: { capable: true, title: "PASKAM", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32" }, { url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  // Konten boleh sampai tepi layar iPhone; area aman diatur lewat env(safe-area-inset-*).
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f7fb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-dvh antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
