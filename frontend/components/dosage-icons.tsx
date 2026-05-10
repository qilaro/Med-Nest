import React from 'react';

type IconProps = React.SVGAttributes<SVGSVGElement> & { className?: string };

const BG = '#5f9595';
const WHITE = '#ffffff';
const BLACK = '#000000';
const SW = '2.5';
const SW2 = '1.5';

// Capsule — exact Gemini SVG
export const CapsuleIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50) rotate(-45)">
      <rect x="-10" y="-25" width="20" height="50" rx="10" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <path d="M -10 0 L 10 0" stroke={BLACK} strokeWidth={SW}/>
      <path d="M -10 -5 Q 0 -10 10 -5" fill="none" stroke={BLACK} strokeWidth={SW2} opacity="0.3"/>
    </g>
  </svg>
);

// Tablet — round pill
export const TabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <ellipse cx="0" cy="0" rx="32" ry="22" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <line x1="-22" y1="0" x2="22" y2="0" stroke={BLACK} strokeWidth={SW}/>
    </g>
  </svg>
);

// Syrup Bottle
export const SyrupBottleIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <rect x="-14" y="-8" width="28" height="42" rx="5" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <rect x="-10" y="-14" width="20" height="8" rx="2" stroke={BLACK} strokeWidth={SW}/>
      <line x1="-10" y1="8" x2="10" y2="8" stroke={BLACK} strokeWidth={SW2}/>
      <line x1="-10" y1="14" x2="10" y2="14" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// Injection Vial
export const InjectionVialIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <rect x="-10" y="0" width="20" height="32" rx="4" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <rect x="-8" y="-10" width="16" height="12" rx="2" stroke={BLACK} strokeWidth={SW}/>
      <circle cx="0" cy="-16" r="3" fill={WHITE} stroke={BLACK} strokeWidth={SW2}/>
      <line x1="0" y1="-16" x2="0" y2="-10" stroke={BLACK} strokeWidth={SW2}/>
      <line x1="-6" y1="12" x2="6" y2="12" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// IV Infusion
export const IVInfusionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <path d="M -15 -10 L 15 -10 L 20 10 A 5 5 0 0 1 15 30 L -15 30 A 5 5 0 0 1 -20 10 Z" fill={WHITE} stroke={BLACK} strokeWidth={SW} strokeLinejoin="round"/>
      <rect x="-5" y="-20" width="10" height="12" rx="2" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <line x1="0" y1="-26" x2="0" y2="-20" stroke={BLACK} strokeWidth={SW2}/>
      <circle cx="0" cy="-30" r="3" fill={WHITE} stroke={BLACK} strokeWidth={SW2}/>
      <line x1="-14" y1="-10" x2="14" y2="-10" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// Cream/Ointment Tube
export const CreamTubeIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <path d="M -10 -22 L 10 -22 L 10 12 A 3 3 0 0 1 7 28 L -7 28 A 3 3 0 0 1 -10 12 Z" fill={WHITE} stroke={BLACK} strokeWidth={SW} strokeLinejoin="round"/>
      <rect x="-8" y="-26" width="16" height="6" rx="2" stroke={BLACK} strokeWidth={SW}/>
      <line x1="0" y1="-12" x2="0" y2="14" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// Eye Drop
export const EyeDropIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <rect x="-8" y="2" width="16" height="28" rx="4" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <path d="M -6 -6 L 0 -18 L 6 -6" fill="none" stroke={BLACK} strokeWidth={SW} strokeLinejoin="round"/>
      <line x1="0" y1="-18" x2="0" y2="2" stroke={BLACK} strokeWidth={SW2}/>
      <circle cx="0" cy="14" r="5" fill="none" stroke={BLACK} strokeWidth={SW2}/>
      <circle cx="0" cy="14" r="2" fill={BLACK}/>
    </g>
  </svg>
);

// Ointment Jar
export const OintmentIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <rect x="-18" y="-5" width="36" height="38" rx="6" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <rect x="-16" y="-12" width="32" height="9" rx="3" stroke={BLACK} strokeWidth={SW}/>
      <line x1="0" y1="5" x2="0" y2="22" stroke={BLACK} strokeWidth={SW2}/>
      <line x1="-8" y1="14" x2="8" y2="14" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// Gel Tube
export const GelIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <path d="M -10 -22 L 10 -22 L 10 12 A 3 3 0 0 1 7 28 L -7 28 A 3 3 0 0 1 -10 12 Z" fill={WHITE} stroke={BLACK} strokeWidth={SW} strokeLinejoin="round"/>
      <rect x="-8" y="-26" width="16" height="6" rx="2" stroke={BLACK} strokeWidth={SW}/>
      <circle cx="-4" cy="-8" r="2" fill="none" stroke={BLACK} strokeWidth={SW2}/>
      <circle cx="4" cy="4" r="2" fill="none" stroke={BLACK} strokeWidth={SW2}/>
      <circle cx="-2" cy="14" r="2" fill="none" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// Suspension
export const SuspensionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <rect x="-14" y="-8" width="28" height="40" rx="5" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <rect x="-10" y="-14" width="20" height="8" rx="2" stroke={BLACK} strokeWidth={SW}/>
      <circle cx="-6" cy="4" r="2" fill="none" stroke={BLACK} strokeWidth={SW2}/>
      <circle cx="5" cy="12" r="2" fill="none" stroke={BLACK} strokeWidth={SW2}/>
      <circle cx="-3" cy="22" r="2" fill="none" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// Suppository
export const SuppositoryIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <ellipse cx="0" cy="5" rx="12" ry="28" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <ellipse cx="0" cy="-14" rx="7" ry="6" fill="none" stroke={BLACK} strokeWidth={SW2}/>
      <line x1="0" y1="-22" x2="0" y2="-18" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// Nasal Spray
export const NasalSprayIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <rect x="-10" y="6" width="20" height="28" rx="4" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <path d="M -8 -2 L 0 -18 L 8 -2" fill="none" stroke={BLACK} strokeWidth={SW} strokeLinejoin="round"/>
      <path d="M -10 -2 L -14 8 L 14 8 L 10 -2" fill="none" stroke={BLACK} strokeWidth={SW2} strokeLinejoin="round"/>
    </g>
  </svg>
);

// Chewable Tablet
export const ChewableTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <ellipse cx="0" cy="2" rx="32" ry="22" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <path d="M -12 -2 L -4 4 L 12 -10" fill="none" stroke={BLACK} strokeWidth={SW} strokeLinejoin="round"/>
      <line x1="-22" y1="2" x2="22" y2="2" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// Bolus
export const BolusIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <rect x="-24" y="-14" width="48" height="28" rx="8" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <line x1="-24" y1="0" x2="24" y2="0" stroke={BLACK} strokeWidth={SW}/>
    </g>
  </svg>
);

// Powder
export const PowderIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <rect x="-16" y="-2" width="32" height="36" rx="6" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <rect x="-14" y="-8" width="28" height="8" rx="2" stroke={BLACK} strokeWidth={SW}/>
      <circle cx="-6" cy="8" r="1.5" fill={BLACK} opacity="0.4"/>
      <circle cx="5" cy="16" r="1.5" fill={BLACK} opacity="0.4"/>
      <circle cx="-3" cy="22" r="1.5" fill={BLACK} opacity="0.4"/>
    </g>
  </svg>
);

// Solution
export const SolutionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <rect x="-14" y="-6" width="28" height="38" rx="5" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <rect x="-10" y="-12" width="20" height="8" rx="2" stroke={BLACK} strokeWidth={SW}/>
      <line x1="-10" y1="6" x2="10" y2="6" stroke={BLACK} strokeWidth={SW2}/>
      <line x1="-10" y1="12" x2="10" y2="12" stroke={BLACK} strokeWidth={SW2}/>
      <line x1="-10" y1="18" x2="6" y2="18" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// XR Extended Release
export const XRTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <ellipse cx="0" cy="2" rx="32" ry="22" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <line x1="-22" y1="2" x2="22" y2="2" stroke={BLACK} strokeWidth={SW}/>
      <circle cx="0" cy="2" r="10" fill="none" stroke={BLACK} strokeWidth={SW}/>
      <line x1="0" y1="2" x2="0" y2="-8" stroke={BLACK} strokeWidth={SW2}/>
      <line x1="0" y1="2" x2="7" y2="0" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// Enteric Coated
export const EntericTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <ellipse cx="0" cy="2" rx="32" ry="22" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <ellipse cx="0" cy="2" rx="24" ry="15" fill="none" stroke={BLACK} strokeWidth={SW2} strokeDasharray="6 4"/>
      <line x1="-22" y1="2" x2="22" y2="2" stroke={BLACK} strokeWidth={SW}/>
    </g>
  </svg>
);

// Inhaler
export const InhalerIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <rect x="-22" y="-10" width="44" height="22" rx="4" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <rect x="-20" y="-16" width="14" height="8" rx="2" stroke={BLACK} strokeWidth={SW}/>
      <line x1="-6" y1="1" x2="18" y2="1" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// Paediatric Drops
export const PaediatricDropsIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect width="100" height="100" fill={BG}/>
    <g transform="translate(50, 50)">
      <rect x="-7" y="2" width="14" height="28" rx="3" fill={WHITE} stroke={BLACK} strokeWidth={SW}/>
      <path d="M -5 -4 L 0 -16 L 5 -4" fill="none" stroke={BLACK} strokeWidth={SW} strokeLinejoin="round"/>
      <circle cx="0" cy="12" r="2" fill="none" stroke={BLACK} strokeWidth={SW2}/>
      <circle cx="0" cy="20" r="1.5" fill="none" stroke={BLACK} strokeWidth={SW2}/>
    </g>
  </svg>
);

// Pill (generic fallback)
export const PillIcon = CapsuleIcon;

// Icon name to dosage form mapping
export const dosageFormIcons: Record<string, React.FC<IconProps>> = {
  tablet: TabletIcon,
  capsule: CapsuleIcon,
  'capsule (enteric coated)': EntericTabletIcon,
  injection: InjectionVialIcon,
  'im injection': InjectionVialIcon,
  'iv injection': IVInfusionIcon,
  'iv infusion': IVInfusionIcon,
  'iv/im injection': InjectionVialIcon,
  'im/iv injection': InjectionVialIcon,
  syrup: SyrupBottleIcon,
  'powder for suspension': SuspensionIcon,
  suspension: SuspensionIcon,
  'oral suspension': SuspensionIcon,
  cream: CreamTubeIcon,
  ointment: OintmentIcon,
  gel: GelIcon,
  'eye drops': EyeDropIcon,
  'ophthalmic solution': EyeDropIcon,
  'paediatric drops': PaediatricDropsIcon,
  'nasal spray': NasalSprayIcon,
  bolus: BolusIcon,
  powder: PowderIcon,
  'oral solution': SolutionIcon,
  solution: SolutionIcon,
  'tablet (extended release)': XRTabletIcon,
  'xr tablet': XRTabletIcon,
  'tablet (enteric coated)': EntericTabletIcon,
  'chewable tablet': ChewableTabletIcon,
  suppository: SuppositoryIcon,
  inhaler: InhalerIcon,
  'inhalation capsule': InhalerIcon,
};

export function getDosageIcon(form: string): React.FC<IconProps> {
  const key = (form || '').toLowerCase().trim();
  return dosageFormIcons[key] || TabletIcon;
}
