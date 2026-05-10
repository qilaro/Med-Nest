import React from 'react';

type IconProps = React.SVGAttributes<SVGSVGElement> & { className?: string };

const COLOR = '#5F8B8B';
const ACCENT = '#3A6B6B';
const LIGHT = '#A8D0D0';

export const TabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <ellipse cx="12" cy="12" rx="10" ry="7" fill="white" stroke={COLOR} strokeWidth="1.5"/>
    <ellipse cx="12" cy="11" rx="10" ry="7" fill={LIGHT} fillOpacity="0.15"/>
    <line x1="6" y1="12" x2="18" y2="12" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const CapsuleIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="4" y="8" width="16" height="8" rx="4" fill={LIGHT} fillOpacity="0.15"/>
    <rect x="4" y="8" width="16" height="8" rx="4" stroke={COLOR} strokeWidth="1.5"/>
    <line x1="12" y1="8" x2="12" y2="16" stroke={COLOR} strokeWidth="1.5"/>
    <path d="M8 8v8M16 8v8" stroke={COLOR} strokeWidth="0.75" strokeDasharray="2 2"/>
  </svg>
);

export const InjectionVialIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="8" y="10" width="8" height="12" rx="2" fill={LIGHT} fillOpacity="0.15"/>
    <rect x="8" y="10" width="8" height="12" rx="2" stroke={COLOR} strokeWidth="1.5"/>
    <path d="M10 7v3M14 7v3" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="9" y="2" width="6" height="5" rx="1" stroke={COLOR} strokeWidth="1.5"/>
    <line x1="12" y1="13" x2="12" y2="19" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1.5" fill={ACCENT}/>
  </svg>
);

export const SyrupBottleIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="8" y="6" width="8" height="16" rx="2" fill={LIGHT} fillOpacity="0.15"/>
    <rect x="8" y="6" width="8" height="16" rx="2" stroke={COLOR} strokeWidth="1.5"/>
    <rect x="9" y="2" width="6" height="4" rx="1" stroke={COLOR} strokeWidth="1.5"/>
    <line x1="12" y1="10" x2="12" y2="18" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="10" y1="14" x2="14" y2="14" stroke={COLOR} strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
  </svg>
);

export const CreamTubeIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path d="M9 4h6M9 4v16c0 1.1.9 2 2 2h2a2 2 0 002-2V4H9z" fill={LIGHT} fillOpacity="0.15"/>
    <path d="M9 4h6M9 4v16c0 1.1.9 2 2 2h2a2 2 0 002-2V4H9z" stroke={COLOR} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7 18c0-1.1.9-2 2-2h6a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2z" stroke={COLOR} strokeWidth="1.5" strokeLinejoin="round"/>
    <line x1="12" y1="8" x2="12" y2="16" stroke={COLOR} strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const EyeDropIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="9" y="8" width="6" height="12" rx="2" fill={LIGHT} fillOpacity="0.15"/>
    <rect x="9" y="8" width="6" height="12" rx="2" stroke={COLOR} strokeWidth="1.5"/>
    <path d="M10 4l2-2 2 2" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2v6" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="14" r="2" fill={ACCENT} fillOpacity="0.2" stroke={ACCENT} strokeWidth="1"/>
    <path d="M8 14c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke={COLOR} strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const IVInfusionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="9" y="12" width="6" height="10" rx="2" fill={LIGHT} fillOpacity="0.15"/>
    <rect x="9" y="12" width="6" height="10" rx="2" stroke={COLOR} strokeWidth="1.5"/>
    <rect x="10" y="8" width="4" height="4" rx="1" stroke={COLOR} strokeWidth="1.5"/>
    <line x1="12" y1="3" x2="12" y2="8" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="2" r="1.5" fill={ACCENT}/>
    <path d="M7 2h10" stroke={COLOR} strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const OintmentIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="7" y="8" width="10" height="14" rx="3" fill={LIGHT} fillOpacity="0.15"/>
    <rect x="7" y="8" width="10" height="14" rx="3" stroke={COLOR} strokeWidth="1.5"/>
    <rect x="8" y="4" width="8" height="4" rx="1" stroke={COLOR} strokeWidth="1.5"/>
    <line x1="12" y1="12" x2="12" y2="18" stroke={COLOR} strokeWidth="1" strokeLinecap="round"/>
    <line x1="9" y1="15" x2="15" y2="15" stroke={COLOR} strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const GelIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="8" y="6" width="8" height="14" rx="3" fill={LIGHT} fillOpacity="0.3"/>
    <rect x="8" y="6" width="8" height="14" rx="3" stroke={COLOR} strokeWidth="1.5"/>
    <rect x="9" y="3" width="6" height="3" rx="1" stroke={COLOR} strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="2" fill={ACCENT} fillOpacity="0.2"/>
    <circle cx="10" cy="17" r="1" fill={ACCENT} fillOpacity="0.15"/>
    <circle cx="9" cy="10" r="1" fill={ACCENT} fillOpacity="0.1"/>
  </svg>
);

export const SuspensionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="8" y="5" width="8" height="16" rx="2" fill={LIGHT} fillOpacity="0.15"/>
    <rect x="8" y="5" width="8" height="16" rx="2" stroke={COLOR} strokeWidth="1.5"/>
    <rect x="9" y="2" width="6" height="3" rx="1" stroke={COLOR} strokeWidth="1.5"/>
    <circle cx="11" cy="12" r="1" fill={ACCENT} fillOpacity="0.2"/>
    <circle cx="13" cy="15" r="1" fill={ACCENT} fillOpacity="0.2"/>
    <circle cx="10" cy="17" r="1" fill={ACCENT} fillOpacity="0.15"/>
    <circle cx="12" cy="9" r="1" fill={ACCENT} fillOpacity="0.15"/>
  </svg>
);

export const SuppositoryIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path d="M7 22c0-2.8 2.2-5 5-5s5 2.2 5 5" fill={LIGHT} fillOpacity="0.15"/>
    <ellipse cx="12" cy="12" rx="5" ry="10" fill="white" stroke={COLOR} strokeWidth="1.5"/>
    <ellipse cx="12" cy="5" rx="3" ry="2" stroke={COLOR} strokeWidth="1.5"/>
  </svg>
);

export const NasalSprayIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="8" y="10" width="8" height="12" rx="2" fill={LIGHT} fillOpacity="0.15"/>
    <rect x="8" y="10" width="8" height="12" rx="2" stroke={COLOR} strokeWidth="1.5"/>
    <path d="M10 7l2-5 2 5" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 7l-1 3h6l-1-3" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="14" cy="14" r="1" fill={ACCENT} fillOpacity="0.3"/>
    <circle cx="10" cy="16" r="1" fill={ACCENT} fillOpacity="0.2"/>
  </svg>
);

export const ChewableTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <ellipse cx="12" cy="13" rx="10" ry="7" fill={LIGHT} fillOpacity="0.2"/>
    <ellipse cx="12" cy="13" rx="10" ry="7" stroke={COLOR} strokeWidth="1.5"/>
    <path d="M8 11l3 3 5-5" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="6" y1="13" x2="18" y2="13" stroke={COLOR} strokeWidth="1" strokeLinecap="round"/>
    <path d="M9 8l1.5 3M14 8l-1.5 3" stroke={COLOR} strokeWidth="0.75" strokeLinecap="round"/>
  </svg>
);

export const BolusIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="5" y="7" width="14" height="9" rx="3" fill={LIGHT} fillOpacity="0.15"/>
    <rect x="5" y="7" width="14" height="9" rx="3" stroke={COLOR} strokeWidth="1.5"/>
    <line x1="5" y1="11" x2="19" y2="11" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 5v2M15 5v2" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const PowderIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="6" y="8" width="12" height="14" rx="2" fill={LIGHT} fillOpacity="0.12"/>
    <rect x="6" y="8" width="12" height="14" rx="2" stroke={COLOR} strokeWidth="1.5"/>
    <rect x="7" y="5" width="10" height="3" rx="1" stroke={COLOR} strokeWidth="1.5"/>
    <circle cx="9" cy="12" r="1" fill={LIGHT}/>
    <circle cx="12" cy="15" r="0.8" fill={LIGHT}/>
    <circle cx="11" cy="18" r="0.6" fill={LIGHT}/>
    <circle cx="14" cy="12" r="0.7" fill={LIGHT}/>
    <circle cx="10" cy="14" r="0.5" fill={LIGHT}/>
  </svg>
);

export const SolutionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <rect x="8" y="6" width="8" height="15" rx="2" fill={LIGHT} fillOpacity="0.2"/>
    <rect x="8" y="6" width="8" height="15" rx="2" stroke={COLOR} strokeWidth="1.5"/>
    <rect x="9" y="3" width="6" height="3" rx="1" stroke={COLOR} strokeWidth="1.5"/>
    <line x1="10" y1="10" x2="14" y2="10" stroke={COLOR} strokeWidth="1" strokeLinecap="round"/>
    <line x1="10" y1="13" x2="14" y2="13" stroke={COLOR} strokeWidth="1" strokeLinecap="round"/>
    <line x1="10" y1="16" x2="14" y2="16" stroke={COLOR} strokeWidth="1" strokeLinecap="round"/>
    <circle cx="12" cy="20" r="1" fill={ACCENT} fillOpacity="0.3"/>
  </svg>
);

export const XRTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <ellipse cx="12" cy="12" rx="10" ry="7" fill="white" stroke={COLOR} strokeWidth="1.5"/>
    <ellipse cx="12" cy="11" rx="10" ry="7" fill={LIGHT} fillOpacity="0.15"/>
    <path d="M7 12l4 4 6-6" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke={COLOR} strokeWidth="1" strokeDasharray="3 2"/>
  </svg>
);

export const EntericTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <ellipse cx="12" cy="13" rx="10" ry="7" fill="white" stroke={COLOR} strokeWidth="1.5"/>
    <ellipse cx="12" cy="13" rx="8" ry="5" fill={LIGHT} fillOpacity="0.15" stroke={ACCENT} strokeWidth="0.75" strokeDasharray="4 3"/>
    <line x1="6" y1="13" x2="18" y2="13" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round"/>
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
  'powder for suspension': SuspensionIcon,
  suspension: SuspensionIcon,
  'oral suspension': SuspensionIcon,
  cream: CreamTubeIcon,
  ointment: OintmentIcon,
  gel: GelIcon,
  'eye drops': EyeDropIcon,
  'ophthalmic solution': EyeDropIcon,
  'paediatric drops': EyeDropIcon,
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
};

export function getDosageIcon(form: string): React.FC<IconProps> {
  const key = (form || '').toLowerCase().trim();
  return dosageFormIcons[key] || TabletIcon;
}
