import { drugService } from "@/lib/services/drugService";
import Link from "next/link";

// Professional realistic pharmaceutical icons - CRYSTAL CLEAR
const DosageIcons = {
  tablet: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Three distinct circular pills - grouped together */}
      {/* Back left pill - blue */}
      <circle cx="6" cy="8" r="3.5" fill="#3B82F6" stroke="#1F2937" strokeWidth="1.1" />
      <ellipse cx="5.2" cy="7" rx="1.2" ry="1" fill="white" opacity="0.5" />
      
      {/* Front center pill - larger, brighter blue */}
      <circle cx="12" cy="14" r="4" fill="#0EA5E9" stroke="#1F2937" strokeWidth="1.2" />
      <ellipse cx="11" cy="13" rx="1.5" ry="1.2" fill="white" opacity="0.6" />
      
      {/* Back right pill - cyan */}
      <circle cx="18" cy="9" r="3.5" fill="#06B6D4" stroke="#1F2937" strokeWidth="1.1" />
      <ellipse cx="18.8" cy="8" rx="1.2" ry="1" fill="white" opacity="0.5" />
    </svg>
  ),
  capsule: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Elongated capsule - clearly two halves */}
      {/* Red half (left) - rounded end */}
      <path d="M5 11C5 8.2 6.5 6 8.5 6L12 6L12 18L8.5 18C6.5 18 5 15.8 5 13Z" fill="#EF4444" stroke="#1F2937" strokeWidth="1.2" strokeLinejoin="round" />
      
      {/* White half (right) - rounded end */}
      <path d="M19 11C19 8.2 17.5 6 15.5 6L12 6L12 18L15.5 18C17.5 18 19 15.8 19 13Z" fill="white" stroke="#1F2937" strokeWidth="1.2" strokeLinejoin="round" />
      
      {/* Center seam/divider */}
      <line x1="12" y1="6" x2="12" y2="18" stroke="#1F2937" strokeWidth="1.2" opacity="0.6" />
      
      {/* Shine highlights */}
      <ellipse cx="7" cy="8" rx="1.2" ry="1.8" fill="white" opacity="0.7" />
      <ellipse cx="17" cy="8" rx="1.2" ry="1.8" fill="#D0D0D0" opacity="0.7" />
    </svg>
  ),
  drop: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Large, obvious liquid drop - clear teardrop shape */}
      <path d="M12 2C12 2 8 9 8 14C8 18 9.8 21 12 21C14.2 21 16 18 16 14C16 9 12 2 12 2Z" fill="#06B6D4" stroke="#1F2937" strokeWidth="1.3" strokeLinejoin="round" />
      {/* Highlight shine */}
      <ellipse cx="10.5" cy="8" rx="2" ry="2.5" fill="white" opacity="0.6" />
    </svg>
  ),
  bottle: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Bottle neck - thin at top */}
      <rect x="10.5" y="1.5" width="3" height="4" rx="0.3" fill="white" stroke="#1F2937" strokeWidth="1" />
      
      {/* Bottle cap */}
      <rect x="9.5" y="0.5" width="5" height="1.2" rx="0.2" fill="#64748B" stroke="#1F2937" strokeWidth="0.8" />
      
      {/* Main bottle body - wider */}
      <path d="M8 5.5H16C16.8 5.5 17.5 6.2 17.5 7V19C17.5 20.5 16.5 21 15 21H9C7.5 21 6.5 20.5 6.5 19V7C6.5 6.2 7.2 5.5 8 5.5Z" fill="#F0F9FF" stroke="#1F2937" strokeWidth="1.3" />
      
      {/* Liquid inside - filled 2/3 */}
      <path d="M8.5 14H15.5L15 19C15 20 14.5 20.5 13 20.5H11C9.5 20.5 9 20 9 19L8.5 14Z" fill="#DBEAFE" stroke="none" />
      
      {/* Glass shine */}
      <path d="M8.5 6L9 16" stroke="white" strokeWidth="1.2" opacity="0.5" />
    </svg>
  ),
  syringe: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Barrel/cylinder */}
      <rect x="6" y="10" width="10" height="5" rx="1" fill="#E0E7FF" stroke="#1F2937" strokeWidth="1.2" />
      {/* Plunger */}
      <circle cx="5" cy="12.5" r="2" fill="#1F2937" stroke="#1F2937" strokeWidth="0.8" />
      <rect x="2" y="11.5" width="2.5" height="2" fill="#64748B" stroke="#1F2937" strokeWidth="0.8" />
      {/* Needle - angled */}
      <path d="M16 13L20 8" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 13L20 8" stroke="#E0E7FF" strokeWidth="0.7" opacity="0.4" strokeLinecap="round" />
      {/* Needle tip */}
      <circle cx="20" cy="8" r="0.5" fill="#1F2937" />
      {/* Liquid in barrel */}
      <rect x="7" y="11" width="3" height="3" fill="#3B82F6" opacity="0.4" rx="0.5" />
    </svg>
  ),
  patch: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Patch backing */}
      <rect x="5" y="7" width="10" height="10" rx="2" fill="#FEF3C7" stroke="#1F2937" strokeWidth="1.2" />
      {/* Adhesive/rounded corners highlight */}
      <path d="M6 8C6 7.4 6.4 7 7 7H14C14.6 7 15 7.4 15 8V16C15 16.6 14.6 17 14 17H7C6.4 17 6 16.6 6 16V8Z" fill="none" stroke="#D97706" strokeWidth="0.8" opacity="0.5" strokeDasharray="2,2" />
      {/* Center indicator */}
      <line x1="10" y1="10" x2="10" y2="14" stroke="#1F2937" strokeWidth="1.2" />
      <line x1="8" y1="12" x2="12" y2="12" stroke="#1F2937" strokeWidth="1.2" />
      {/* Shine/sheen */}
      <ellipse cx="8" cy="9" rx="1" ry="0.5" fill="white" opacity="0.7" />
    </svg>
  ),
  spray: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Pump nozzle head - clearly visible */}
      <circle cx="12" cy="1.5" r="1.8" fill="#64748B" stroke="#1F2937" strokeWidth="1" />
      <line x1="12" y1="0.2" x2="12" y2="0.8" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Trigger handle */}
      <path d="M14.5 3.5C15.5 3.5 16 4.5 15.5 6.5" fill="none" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />
      
      {/* Bottle neck */}
      <rect x="10" y="3.5" width="4" height="3.5" rx="0.5" fill="#E0E7FF" stroke="#1F2937" strokeWidth="1.1" />
      
      {/* Main spray bottle body */}
      <path d="M8 7H16C16.6 7 17.2 7.4 17.2 8V18C17.2 19.5 16.2 20 14.5 20H9.5C7.8 20 6.8 19.5 6.8 18V8C6.8 7.4 7.4 7 8 7Z" fill="#F0F9FF" stroke="#1F2937" strokeWidth="1.2" />
      
      {/* Liquid inside bottle */}
      <path d="M9 14H15L14.5 18C14.5 19 14 19.5 12.5 19.5H11.5C10 19.5 9.5 19 9.5 18L9 14Z" fill="#06B6D4" opacity="0.6" />
      
      {/* Spray mist particles coming out */}
      <circle cx="18.5" cy="4" r="0.7" fill="#60A5FA" opacity="0.7" />
      <circle cx="20" cy="5.5" r="0.5" fill="#60A5FA" opacity="0.6" />
      <circle cx="19.2" cy="7" r="0.6" fill="#60A5FA" opacity="0.5" />
    </svg>
  ),
  powder: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Powder bottle container - tall & narrow */}
      {/* Top pour spout */}
      <path d="M9 4.5L8.5 7H15.5L15 4.5C15 3.5 14.5 2 13 2H11C9.5 2 9 3.5 9 4.5Z" fill="#FFF7ED" stroke="#1F2937" strokeWidth="1.1" strokeLinejoin="round" />
      
      {/* Main container body */}
      <path d="M8 7H16C16.6 7 17.2 7.4 17.2 8V19C17.2 20.5 16.2 21 14.5 21H9.5C7.8 21 6.8 20.5 6.8 19V8C6.8 7.4 7.4 7 8 7Z" fill="#FEE2E2" stroke="#1F2937" strokeWidth="1.2" />
      
      {/* Powder fill lines (texture) */}
      <line x1="9" y1="10" x2="15" y2="10" stroke="#1F2937" strokeWidth="0.6" opacity="0.35" />
      <line x1="9" y1="13" x2="15" y2="13" stroke="#1F2937" strokeWidth="0.6" opacity="0.35" />
      <line x1="9" y1="16" x2="15" y2="16" stroke="#1F2937" strokeWidth="0.6" opacity="0.35" />
      
      {/* Spout shine */}
      <ellipse cx="11.5" cy="5" rx="1.2" ry="0.7" fill="white" opacity="0.6" />
    </svg>
  ),
  injection: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Syringe barrel - tilted/angled */}
      <rect x="4" y="10" width="11" height="5" rx="1.5" fill="#FECACA" stroke="#1F2937" strokeWidth="1.2" transform="rotate(-20 9.5 12.5)" />
      
      {/* Plunger (left circle) */}
      <circle cx="3" cy="13" r="2.2" fill="#64748B" stroke="#1F2937" strokeWidth="0.9" />
      <line x1="0.5" y1="13" x2="2.5" y2="13" stroke="#64748B" strokeWidth="1.2" />
      
      {/* Needle - angled upward from barrel */}
      <path d="M15 9L19 3" stroke="#1F2937" strokeWidth="1.8" strokeLinecap="round" />
      {/* Needle shine/highlight */}
      <path d="M15.3 8.7L18.8 4" stroke="#60A5FA" strokeWidth="0.7" opacity="0.5" strokeLinecap="round" />
      
      {/* Needle hub/connector where meets barrel */}
      <circle cx="15" cy="10.5" r="1.5" fill="#64748B" stroke="#1F2937" strokeWidth="1" />
      
      {/* Liquid visible in barrel - blue */}
      <rect x="5.5" y="11" width="4" height="3" fill="#3B82F6" opacity="0.6" rx="0.8" transform="rotate(-20 7.5 12.5)" />
      
      {/* Needle sharp tip */}
      <circle cx="19" cy="3" r="0.6" fill="#1F2937" />
    </svg>
  ),
  blister: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Blister backing card */}
      <rect x="2" y="8" width="20" height="12" rx="1.5" fill="#F5F3FF" stroke="#1F2937" strokeWidth="1.2" />
      {/* Foil backing */}
      <rect x="3" y="9" width="18" height="10" rx="1" fill="#D1D5DB" stroke="#1F2937" strokeWidth="0.8" opacity="0.4" />
      {/* Pills in blister pockets */}
      <circle cx="7" cy="12" r="2.5" fill="#3B82F6" stroke="#1F2937" strokeWidth="1" />
      <circle cx="13" cy="12" r="2.5" fill="#0EA5E9" stroke="#1F2937" strokeWidth="1" />
      <circle cx="19" cy="12" r="2.5" fill="#06B6D4" stroke="#1F2937" strokeWidth="1" />
      {/* Shine on pills */}
      <ellipse cx="6" cy="11" rx="0.8" ry="0.6" fill="white" opacity="0.6" />
      <ellipse cx="12" cy="11" rx="0.8" ry="0.6" fill="white" opacity="0.6" />
      {/* Text area (medication name) */}
      <rect x="3" y="20" width="18" height="1" fill="#1F2937" opacity="0.1" />
    </svg>
  ),
  cream: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Tube cap */}
      <rect x="9" y="1" width="6" height="2" rx="0.5" fill="#64748B" stroke="#1F2937" strokeWidth="0.8" />
      {/* Tube body */}
      <path d="M7 3H17C17.5 3 18 3.5 18 4V17C18 18.5 17 19 15.5 19H8.5C7 19 6 18.5 6 17V4C6 3.5 6.5 3 7 3Z" fill="#FEF3C7" stroke="#1F2937" strokeWidth="1.2" />
      {/* Cream/content bulge at bottom */}
      <path d="M8 14H16C16 16 15.5 18 13.5 18.5H10.5C8.5 18 8 16 8 14Z" fill="#FCD34D" stroke="none" />
      {/* Tube opening hint */}
      <ellipse cx="12" cy="3" rx="1.5" ry="0.5" fill="white" opacity="0.5" />
      {/* Cream texture */}
      <circle cx="10" cy="12" r="0.6" fill="#F59E0B" opacity="0.4" />
      <circle cx="14" cy="13" r="0.5" fill="#F59E0B" opacity="0.4" />
    </svg>
  ),
};

const MedicineBackground = () => (
  <svg
    aria-hidden="true"
    className="absolute inset-0 h-full w-full pointer-events-none select-none"
    viewBox="0 0 1600 1100"
    preserveAspectRatio="none"
  >
    <defs>
      <g id="pill-outline">
        <rect x="-24" y="-10" width="48" height="20" rx="10" fill="none" stroke="white" strokeOpacity="0.28" strokeWidth="4" />
        <line x1="-2" y1="-8" x2="-2" y2="8" stroke="white" strokeOpacity="0.24" strokeWidth="4" />
      </g>
      <g id="tablet-outline">
        <ellipse cx="0" cy="0" rx="14" ry="20" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="4" />
        <line x1="-7" y1="0" x2="7" y2="0" stroke="white" strokeOpacity="0.18" strokeWidth="4" />
      </g>
      <g id="capsule-outline">
        <rect x="-20" y="-10" width="40" height="20" rx="10" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="4" />
        <line x1="0" y1="-10" x2="0" y2="10" stroke="white" strokeOpacity="0.2" strokeWidth="4" />
      </g>
      <g id="bottle-outline">
        <path d="M-14 -16H14V-10C14 -8 12 -6 10 -6H6V14C6 18 3 20 -1 20H1C-3 20 -6 18 -6 14V-6H-10C-12 -6 -14 -8 -14 -10V-16Z" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="4" strokeLinejoin="round" />
        <path d="M-7 -16H7" stroke="white" strokeOpacity="0.18" strokeWidth="4" />
      </g>
      <g id="syringe-outline">
        <rect x="-20" y="-4" width="34" height="8" rx="2" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="4" transform="rotate(-35)" />
        <line x1="12" y1="-8" x2="26" y2="-22" stroke="white" strokeOpacity="0.22" strokeWidth="4" strokeLinecap="round" />
        <line x1="24" y1="-20" x2="29" y2="-25" stroke="white" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g id="blister-outline">
        <rect x="-24" y="-16" width="48" height="32" rx="4" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="4" />
        <circle cx="-10" cy="-6" r="5" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="4" />
        <circle cx="2" cy="-6" r="5" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="4" />
        <circle cx="14" cy="-6" r="5" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="4" />
        <circle cx="-4" cy="6" r="5" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="4" />
        <circle cx="8" cy="6" r="5" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="4" />
      </g>
      <g id="dropper-outline">
        <path d="M-8 -16H8V-8L4 -4V14C4 18 0 22 -4 22H-4C-8 22 -12 18 -12 14V-4L-8 -8V-16Z" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="4" strokeLinejoin="round" />
      </g>
      <g id="vial-outline">
        <rect x="-10" y="-14" width="20" height="28" rx="5" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="4" />
        <rect x="-8" y="-18" width="16" height="6" rx="2" fill="none" stroke="white" strokeOpacity="0.18" strokeWidth="4" />
      </g>
      <g id="ampule-outline">
        <path d="M-8 -18H8L6 -4V10C6 15 3 20 0 20C-3 20 -6 15 -6 10V-4L-8 -18Z" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="4" strokeLinejoin="round" />
      </g>
      <g id="cross-outline">
        <rect x="-16" y="-16" width="32" height="32" rx="6" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="4" />
        <path d="M-5 -10H5V-2H13V8H5V16H-5V8H-13V-2H-5Z" fill="none" stroke="white" strokeOpacity="0.24" strokeWidth="4" strokeLinejoin="round" />
      </g>
      <g id="strip-outline">
        <rect x="-18" y="-28" width="36" height="56" rx="6" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="4" transform="rotate(36)" />
        <circle cx="-5" cy="-10" r="4" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="4" />
        <circle cx="9" cy="4" r="4" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="4" />
      </g>
      <g id="tube-outline">
        <rect x="-12" y="-16" width="24" height="32" rx="6" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="4" />
        <path d="M-8 12H8" stroke="white" strokeOpacity="0.18" strokeWidth="4" />
      </g>
    </defs>

    <rect width="1600" height="1100" fill="#fbfbfb" />
    <rect width="1600" height="1100" fill="url(#bgFade)" />

    <defs>
      <linearGradient id="bgFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f1f1f1" stopOpacity="0.9" />
        <stop offset="45%" stopColor="#f8f8f8" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.98" />
      </linearGradient>
    </defs>

    <g opacity="0.24">
      <use href="#cross-outline" x="34" y="186" />
      <use href="#tablet-outline" x="102" y="70" />
      <use href="#pill-outline" x="190" y="290" transform="rotate(28 190 290)" />
      <use href="#syringe-outline" x="56" y="430" transform="rotate(2 56 430)" />
      <use href="#vial-outline" x="156" y="592" />
      <use href="#cross-outline" x="56" y="780" transform="rotate(-14 56 780)" />
      <use href="#tablet-outline" x="136" y="948" transform="rotate(-28 136 948)" />
      <use href="#ampule-outline" x="286" y="64" transform="rotate(42 286 64)" />
      <use href="#blister-outline" x="256" y="184" transform="rotate(-30 256 184)" />
      <use href="#tube-outline" x="236" y="404" transform="rotate(36 236 404)" />
      <use href="#syringe-outline" x="222" y="910" transform="rotate(-18 222 910)" />
    </g>

    <g opacity="0.16">
      <use href="#tablet-outline" x="440" y="94" />
      <use href="#ampule-outline" x="520" y="208" transform="rotate(-36 520 208)" />
      <use href="#capsule-outline" x="606" y="134" transform="rotate(18 606 134)" />
      <use href="#pill-outline" x="694" y="324" transform="rotate(42 694 324)" />
      <use href="#tablet-outline" x="804" y="78" transform="rotate(-8 804 78)" />
      <use href="#capsule-outline" x="892" y="218" transform="rotate(-24 892 218)" />
      <use href="#vial-outline" x="1038" y="138" />
      <use href="#blister-outline" x="1086" y="350" transform="rotate(-26 1086 350)" />
      <use href="#cross-outline" x="1210" y="112" transform="rotate(8 1210 112)" />
      <use href="#syringe-outline" x="1316" y="210" transform="rotate(-26 1316 210)" />
      <use href="#tube-outline" x="1470" y="88" transform="rotate(34 1470 88)" />
      <use href="#dropper-outline" x="1498" y="332" transform="rotate(14 1498 332)" />
    </g>

    <g opacity="0.11">
      <use href="#dropper-outline" x="348" y="610" transform="rotate(8 348 610)" />
      <use href="#blister-outline" x="480" y="760" transform="rotate(44 480 760)" />
      <use href="#tablet-outline" x="650" y="640" transform="rotate(20 650 640)" />
      <use href="#pill-outline" x="748" y="910" transform="rotate(-32 748 910)" />
      <use href="#syringe-outline" x="872" y="790" transform="rotate(34 872 790)" />
      <use href="#capsule-outline" x="980" y="952" transform="rotate(-26 980 952)" />
      <use href="#vial-outline" x="1146" y="694" transform="rotate(12 1146 694)" />
      <use href="#tube-outline" x="1280" y="878" transform="rotate(-30 1280 878)" />
      <use href="#cross-outline" x="1446" y="720" transform="rotate(20 1446 720)" />
      <use href="#ampule-outline" x="1530" y="920" transform="rotate(-18 1530 920)" />
    </g>

    <g opacity="0.08">
      <use href="#pill-outline" x="426" y="460" transform="rotate(12 426 460)" />
      <use href="#capsule-outline" x="558" y="488" transform="rotate(-44 558 488)" />
      <use href="#tablet-outline" x="900" y="452" transform="rotate(28 900 452)" />
      <use href="#blister-outline" x="1246" y="482" transform="rotate(16 1246 482)" />
      <use href="#pill-outline" x="1432" y="584" transform="rotate(-16 1432 584)" />
    </g>

    <g opacity="0.06">
      <use href="#tablet-outline" x="70" y="1040" transform="rotate(24 70 1040)" />
      <use href="#capsule-outline" x="226" y="108" transform="rotate(-32 226 108)" />
      <use href="#blister-outline" x="356" y="1060" transform="rotate(12 356 1060)" />
      <use href="#syringe-outline" x="590" y="1020" transform="rotate(-10 590 1020)" />
      <use href="#vial-outline" x="760" y="108" transform="rotate(10 760 108)" />
      <use href="#dropper-outline" x="1042" y="1030" transform="rotate(22 1042 1030)" />
      <use href="#pill-outline" x="1182" y="86" transform="rotate(-18 1182 86)" />
      <use href="#cross-outline" x="1384" y="1044" transform="rotate(26 1384 1044)" />
    </g>
  </svg>
);

type DosageFormIcon = keyof typeof DosageIcons;

const getIconForDosageForm = (name: string): DosageFormIcon => {
  const lower = name.toLowerCase();
  if (lower.includes("tablet") || lower.includes("bolus") || lower.includes("chewable") || lower.includes("dispersible") || lower.includes("effervescent")) return "tablet";
  if (lower.includes("capsule")) return "capsule";
  if (lower.includes("drop") || lower.includes("ear") || lower.includes("eye")) return "drop";
  if (lower.includes("solution") || lower.includes("dialysis") || lower.includes("suspension") || lower.includes("syrup") || lower.includes("emulsion")) return "bottle";
  if (lower.includes("spray")) return "spray";
  if (lower.includes("powder") || lower.includes("granule")) return "powder";
  if (lower.includes("inject") || lower.includes("infusion") || lower.includes("vial") || lower.includes("ampule")) return "injection";
  if (lower.includes("patch")) return "patch";
  if (lower.includes("cream") || lower.includes("ointment")) return "cream";
  if (lower.includes("blister") || lower.includes("strip")) return "blister";
  return "tablet";
};

// Actual dosage forms from Bangladesh pharmaceutical database
const ALL_DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Suspension",
  "Sachet",
  "Syrup",
  "Paediatric Drops",
];

export default async function DosageFormsPage() {
  let dosageForms = await drugService.getDosageForms();
  
  // Ensure ALL dosage forms are displayed, even if count is 0
  const existingNames = new Set(dosageForms.map(df => df.name));
  for (const form of ALL_DOSAGE_FORMS) {
    if (!existingNames.has(form)) {
      dosageForms.push({ name: form, count: 0 });
    }
  }
  
  // Sort by count (highest first), then alphabetically
  dosageForms.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#f4f4f4]">
      <MedicineBackground />
      <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            List of Available Dosage Forms
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            Explore all medication formats available in our comprehensive database
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {dosageForms.map((df) => {
            const iconKey = getIconForDosageForm(df.name);
            const icon = DosageIcons[iconKey];

            return (
              <Link
                key={df.name}
                href={`/dosage-forms/${df.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group flex flex-col items-center p-4 md:p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:bg-blue-50 transition-all duration-300 cursor-pointer text-center"
              >
                {/* Icon Container */}
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 mb-3 md:mb-4 text-slate-700 group-hover:text-blue-600 transition-colors">
                  {icon}
                </div>

                {/* Name */}
                <h3 className="text-sm md:text-base font-semibold text-slate-900 line-clamp-2 mb-1">
                  {df.name}
                </h3>

                {/* Count */}
                <p className="text-xs md:text-sm text-slate-600 font-medium">
                  {df.count} brand{df.count !== 1 ? "s" : ""}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
