import type { MetadataRoute } from "next";

// Web App Manifest (PRD §19): aplikasi bisa dipasang di layar utama HP.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My PASKAM",
    short_name: "PASKAM",
    description: "Pencatatan operasional lapangan PASKAM",
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f7fb",
    theme_color: "#2563eb",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
