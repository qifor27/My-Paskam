import type { Metadata, Viewport } from "next";

import "./globals.css";

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
    <html lang="id">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
