import type { SVGProps } from "react";

// Ikon unit alat berat bergaya Lucide (grid 24, garis 2, ujung membulat) karena
// Lucide tidak punya excavator/dump truck/derek. Jangan diganti emoji/ikon 3D.
type IconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number };

function Base({ children, strokeWidth = 2, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function ExcavatorIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="2" y="17" width="12" height="4" rx="2" />
      <path d="M4 17v-4h8v4" />
      <path d="M5 13V9h3l1 4" />
      <path d="m12 14 5-7 4 6" />
      <path d="M21 13v3h-3" />
    </Base>
  );
}

export function DumpTruckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M2 6.5 11 8v6" />
      <path d="M2 6.5V14" />
      <path d="M11 14V9.5h4.5L19 13v1" />
      <path d="M2 14h18" />
      <circle cx="6" cy="17.5" r="2" />
      <circle cx="16.5" cy="17.5" r="2" />
    </Base>
  );
}

export function TowTruckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M2 15V10l2.5-3H8v8" />
      <path d="M8 15h13" />
      <path d="m11 15 6-9" />
      <path d="M17 6v4.5" />
      <path d="M17 10.5v1a1.5 1.5 0 0 1-3 0" />
      <circle cx="5" cy="17.5" r="2" />
      <circle cx="17" cy="17.5" r="2" />
    </Base>
  );
}
