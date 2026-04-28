import React, { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * High-Fidelity Realistic Medical Icon Set for Med-Nest
 * Designed with 3D depth, curvature, and anatomical precision.
 */

export const TabletIcon = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {/* Realistic Domed Isometric Tablet */}
    <ellipse cx="12" cy="8.5" rx="9" ry="4.5" /> {/* Top Surface */}
    <path d="M3 8.5v4c0 2.5 4 4.5 9 4.5s9-2 9-4.5v-4" /> {/* Side/Thickness */}
    <path d="M12 5.5v6" strokeOpacity="0.4" /> {/* Score Line following curvature */}
    <path d="M7 7.5c2-1 8-1 10 0" strokeOpacity="0.2" /> {/* Top Highlight */}
  </svg>
);

export const PillIcon = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {/* Realistic 3D Capsule with Shine */}
    <rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)" />
    <path d="m10 8 4 8" strokeOpacity="0.6" /> {/* Connector Line */}
    <path d="M7 10.5c1 0 1.5-.5 1.5-1.5" strokeOpacity="0.3" /> {/* Top Shine */}
  </svg>
);

export const SyrupIcon = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {/* Realistic Glass Medical Bottle */}
    <rect x="9" y="2" width="6" height="3" rx="1" /> {/* Textured Cap */}
    <path d="M10 5h4v2H10V5z" strokeOpacity="0.8" /> {/* Neck */}
    <path d="M7 7h10a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2z" /> {/* Body */}
    <rect x="7" y="11" width="10" height="7" rx="1" strokeOpacity="0.3" /> {/* Detailed Label */}
    <path d="M5 15h14" strokeOpacity="0.1" /> {/* Liquid Level Line */}
    <path d="M11 3.5h2" strokeOpacity="0.5" /> {/* Cap Detail */}
  </svg>
);

export const SyringeIcon = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {/* Precision Professional Syringe */}
    <path d="m18 2 4 4" /> {/* Plunger Handle */}
    <rect x="11" y="11" width="12" height="3" rx="1" transform="rotate(-45 17 12.5)" strokeOpacity="0.3" /> {/* Plunger Stem */}
    <path d="m13 7 4 4" /> {/* Barrel Top Seal */}
    <path d="m5 15 8 8" /> {/* Barrel Outer Left */}
    <path d="m7 13 8 8" /> {/* Barrel Outer Right */}
    <path d="m2 2 4 4" /> {/* Fine Needle */}
    <path d="m9 11 2 2" strokeOpacity="0.5" /> {/* Graduations */}
  </svg>
);

export const IVDripIcon = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M12 2v2" />
    <path d="M8 4h8v8a4 4 0 0 1-4 4h-0a4 4 0 0 1-4-4V4z" />
    <path d="M8 8h8" strokeOpacity="0.2" /> {/* Fluid Line */}
    <path d="M12 16v3" />
    <path d="M9 22h6" />
    <circle cx="12" cy="18" r="0.5" fill="currentColor" /> {/* Drip Detail */}
  </svg>
);

export const DropsIcon = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {/* Realistic Teardrop with Surface Reflection */}
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    <path d="M10 14c.5-1 1.5-1.5 2-1.5" strokeOpacity="0.4" /> {/* Shine */}
  </svg>
);

export const InhalerIcon = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {/* High-Fidelity Respiratory Inhaler */}
    <path d="M7 2h8v4H7z" />
    <path d="M7 6v12a2 2 0 0 0 2 2h6v-4H9V6" />
    <path d="M15 14h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4" />
    <circle cx="17" cy="17" r="0.5" fill="currentColor" /> {/* Nozzle detail */}
    <path d="M11 4h2" strokeOpacity="0.3" /> {/* Top Detail */}
  </svg>
);
