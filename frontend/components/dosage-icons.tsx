import React from 'react';

type IconProps = React.SVGAttributes<SVGSVGElement> & { className?: string };

// Gemini Logo Palette
const CREAM = '#f3dfb7';
const RED = '#bc243c';
const ORANGE = '#d8843e';
const BLUE_GRAY = '#a5bcd0';
const WHITE = '#ffffff';
const BLACK = '#000000';

export const TabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <ellipse cx="100" cy="100" rx="70" ry="50" fill={WHITE} stroke={BLACK} strokeWidth="6"/>
    <ellipse cx="100" cy="95" rx="70" ry="50" fill={CREAM} opacity="0.4"/>
    <line x1="55" y1="100" x2="145" y2="100" stroke={BLACK} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

export const CapsuleIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="55" y="65" width="90" height="70" rx="35" fill={WHITE} stroke={BLACK} strokeWidth="6"/>
    <path d="M55 100h90" stroke={BLACK} strokeWidth="6"/>
    <path d="M55 65v35a35 35 0 0 0 90 0V65Z" fill={RED} opacity="0.35"/>
    <path d="M55 135V100a35 35 0 0 1 90 0v35Z" fill={CREAM} opacity="0.5"/>
  </svg>
);

export const SyrupBottleIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="65" y="60" width="70" height="110" rx="12" fill={CREAM} stroke={BLACK} strokeWidth="6"/>
    <rect x="75" y="35" width="50" height="25" rx="6" stroke={BLACK} strokeWidth="6"/>
    <line x1="80" y1="100" x2="120" y2="100" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
    <line x1="80" y1="120" x2="120" y2="120" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
    <line x1="80" y1="140" x2="110" y2="140" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const InjectionVialIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="75" y="90" width="50" height="80" rx="10" fill={CREAM} stroke={BLACK} strokeWidth="6"/>
    <path d="M75 120h50" stroke={BLACK} strokeWidth="4"/>
    <rect x="82" y="55" width="36" height="35" rx="5" stroke={BLACK} strokeWidth="6"/>
    <circle cx="100" cy="70" r="5" fill={BLACK}/>
    <line x1="100" y1="55" x2="100" y2="45" stroke={BLACK} strokeWidth="5" strokeLinecap="round"/>
    <circle cx="100" cy="38" r="6" fill={RED}/>
  </svg>
);

export const CreamTubeIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <path d="M75 40h50v130a15 15 0 0 1-15 15H90a15 15 0 0 1-15-15V40Z" fill={WHITE} stroke={BLACK} strokeWidth="6" strokeLinejoin="round"/>
    <path d="M65 170a15 15 0 0 0 15 15h40a15 15 0 0 0 15-15" fill={CREAM} stroke={BLACK} strokeWidth="6"/>
    <rect x="70" y="35" width="60" height="10" rx="3" fill={ORANGE} stroke={BLACK} strokeWidth="5"/>
    <line x1="100" y1="80" x2="100" y2="150" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const EyeDropIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="80" y="80" width="40" height="75" rx="8" fill={CREAM} stroke={BLACK} strokeWidth="6"/>
    <path d="M85 55l15-15 15 15" stroke={BLACK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M100 40v40" stroke={BLACK} strokeWidth="6" strokeLinecap="round"/>
    <circle cx="100" cy="115" r="10" fill={BLUE_GRAY} stroke={BLACK} strokeWidth="4"/>
    <circle cx="100" cy="115" r="5" fill={BLACK}/>
    <path d="M80 115c0 11 9 20 20 20s20-9 20-20" stroke={BLACK} strokeWidth="4" strokeLinecap="round" fill="none"/>
  </svg>
);

export const IVInfusionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="65" y="100" width="70" height="70" rx="10" fill={CREAM} stroke={BLACK} strokeWidth="6"/>
    <rect x="80" y="90" width="40" height="15" rx="3" fill={WHITE} stroke={BLACK} strokeWidth="5"/>
    <line x1="100" y1="68" x2="100" y2="90" stroke={BLACK} strokeWidth="5" strokeLinecap="round"/>
    <circle cx="100" cy="62" r="8" fill={RED}/>
    <line x1="65" y1="68" x2="135" y2="68" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
    <line x1="80" y1="120" x2="120" y2="120" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
    <line x1="80" y1="140" x2="120" y2="140" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const OintmentIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="70" y="55" width="60" height="110" rx="12" fill={WHITE} stroke={BLACK} strokeWidth="6"/>
    <rect x="75" y="45" width="50" height="15" rx="4" fill={ORANGE} stroke={BLACK} strokeWidth="5"/>
    <line x1="100" y1="80" x2="100" y2="140" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
    <line x1="85" y1="110" x2="115" y2="110" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const GelIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="70" y="55" width="60" height="110" rx="12" fill={BLUE_GRAY} opacity="0.3" stroke={BLACK} strokeWidth="6"/>
    <rect x="75" y="42" width="50" height="18" rx="4" fill={BLUE_GRAY} stroke={BLACK} strokeWidth="5"/>
    <circle cx="90" cy="90" r="8" fill={BLUE_GRAY} stroke={BLACK} strokeWidth="3" opacity="0.6"/>
    <circle cx="110" cy="110" r="6" fill={BLUE_GRAY} stroke={BLACK} strokeWidth="3" opacity="0.5"/>
    <circle cx="105" cy="140" r="5" fill={BLUE_GRAY} stroke={BLACK} strokeWidth="3" opacity="0.4"/>
  </svg>
);

export const SuspensionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="70" y="50" width="60" height="110" rx="10" fill={CREAM} stroke={BLACK} strokeWidth="6"/>
    <rect x="76" y="36" width="48" height="16" rx="4" stroke={BLACK} strokeWidth="5"/>
    <circle cx="88" cy="85" r="6" fill={ORANGE} stroke={BLACK} strokeWidth="3"/>
    <circle cx="105" cy="105" r="5" fill={BLUE_GRAY} stroke={BLACK} strokeWidth="3"/>
    <circle cx="90" cy="130" r="4" fill={ORANGE} stroke={BLACK} strokeWidth="3"/>
    <circle cx="110" cy="85" r="4" fill={BLUE_GRAY} stroke={BLACK} strokeWidth="3"/>
  </svg>
);

export const SuppositoryIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <ellipse cx="100" cy="105" rx="35" ry="65" fill={WHITE} stroke={BLACK} strokeWidth="6"/>
    <ellipse cx="100" cy="65" rx="20" ry="15" fill={CREAM} stroke={BLACK} strokeWidth="5"/>
    <line x1="100" y1="40" x2="100" y2="50" stroke={BLACK} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

export const NasalSprayIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="75" y="80" width="50" height="80" rx="8" fill={CREAM} stroke={BLACK} strokeWidth="6"/>
    <path d="M82 60l18-30 18 30" stroke={BLACK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M80 60l-8 20h56l-8-20" stroke={BLACK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="82" cy="100" r="4" fill={BLUE_GRAY} opacity="0.6"/>
    <circle cx="110" cy="115" r="3" fill={BLUE_GRAY} opacity="0.4"/>
  </svg>
);

export const ChewableTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <ellipse cx="100" cy="105" rx="70" ry="50" fill={WHITE} stroke={BLACK} strokeWidth="6"/>
    <ellipse cx="100" cy="100" rx="70" ry="50" fill={ORANGE} opacity="0.2"/>
    <path d="M75 95l15 15 35-35" stroke={BLACK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="60" y1="105" x2="140" y2="105" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const BolusIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="55" y="70" width="90" height="55" rx="15" fill={WHITE} stroke={BLACK} strokeWidth="6"/>
    <rect x="55" y="70" width="90" height="55" rx="15" fill={CREAM} opacity="0.4"/>
    <line x1="55" y1="95" x2="145" y2="95" stroke={BLACK} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

export const PowderIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="60" y="65" width="80" height="100" rx="10" fill={WHITE} stroke={BLACK} strokeWidth="6"/>
    <rect x="65" y="52" width="70" height="16" rx="4" stroke={BLACK} strokeWidth="5"/>
    <circle cx="80" cy="90" r="5" fill={ORANGE} opacity="0.6"/>
    <circle cx="105" cy="105" r="4" fill={ORANGE} opacity="0.5"/>
    <circle cx="90" cy="125" r="3" fill={ORANGE} opacity="0.4"/>
    <circle cx="115" cy="90" r="3" fill={ORANGE} opacity="0.3"/>
    <circle cx="100" cy="145" r="4" fill={ORANGE} opacity="0.3"/>
  </svg>
);

export const SolutionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="70" y="55" width="60" height="105" rx="10" fill={BLUE_GRAY} opacity="0.25" stroke={BLACK} strokeWidth="6"/>
    <rect x="76" y="40" width="48" height="18" rx="4" stroke={BLACK} strokeWidth="5"/>
    <line x1="85" y1="85" x2="115" y2="85" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
    <line x1="85" y1="105" x2="115" y2="105" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
    <line x1="85" y1="125" x2="110" y2="125" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const XRTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <ellipse cx="100" cy="105" rx="70" ry="50" fill={WHITE} stroke={BLACK} strokeWidth="6"/>
    <ellipse cx="100" cy="100" rx="70" ry="50" fill={CREAM} opacity="0.4"/>
    <line x1="55" y1="105" x2="145" y2="105" stroke={BLACK} strokeWidth="5" strokeLinecap="round"/>
    <circle cx="100" cy="105" r="22" stroke={BLACK} strokeWidth="6" fill="none"/>
    <line x1="100" y1="105" x2="100" y2="83" stroke={BLACK} strokeWidth="5" strokeLinecap="round"/>
    <line x1="100" y1="105" x2="115" y2="100" stroke={BLACK} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const EntericTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <ellipse cx="100" cy="105" rx="70" ry="50" fill={WHITE} stroke={BLACK} strokeWidth="6"/>
    <ellipse cx="100" cy="105" rx="55" ry="38" fill={RED} opacity="0.2" stroke={RED} strokeWidth="5" strokeDasharray="14 8"/>
    <line x1="55" y1="105" x2="145" y2="105" stroke={BLACK} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

export const InhalerIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="50" y="80" width="100" height="55" rx="8" fill={WHITE} stroke={BLACK} strokeWidth="6"/>
    <rect x="55" y="60" width="40" height="25" rx="4" stroke={BLACK} strokeWidth="6"/>
    <rect x="55" y="60" width="40" height="25" rx="4" fill={BLUE_GRAY} opacity="0.3"/>
    <line x1="95" y1="108" x2="140" y2="108" stroke={BLACK} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

export const PaediatricDropsIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="82" y="70" width="36" height="80" rx="8" fill={CREAM} stroke={BLACK} strokeWidth="6"/>
    <path d="M87 50l13-18 13 18" stroke={BLACK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="100" cy="55" r="5" fill={BLACK}/>
    <circle cx="100" cy="108" r="4" fill={RED}/>
    <circle cx="95" cy="122" r="3" fill={BLUE_GRAY}/>
    <circle cx="103" cy="130" r="2.5" fill={ORANGE}/>
  </svg>
);

export const PillIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} {...props}>
    <rect x="55" y="65" width="90" height="70" rx="35" fill={WHITE} stroke={BLACK} strokeWidth="6"/>
    <path d="M55 100h90" stroke={BLACK} strokeWidth="6"/>
    <path d="M55 65v35a35 35 0 0 0 90 0V65Z" fill={RED} opacity="0.35"/>
    <path d="M55 135V100a35 35 0 0 1 90 0v35Z" fill={CREAM} opacity="0.5"/>
  </svg>
);

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
