import React from 'react';

type IconProps = React.SVGAttributes<SVGSVGElement> & { className?: string };

// Gemini Pixel-Perfect Palette
const BLUE = '#66C2E9';
const LIGHT_BLUE = '#D1EAF7';
const DARK_BLUE = '#39A9DB';
const WHITE = '#ffffff';

// 1. Tablet — round pill with score line
export const TabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <ellipse cx="200" cy="200" rx="130" ry="95" fill={LIGHT_BLUE}/>
    <ellipse cx="200" cy="195" rx="130" ry="95" fill={WHITE}/>
    <line x1="120" y1="200" x2="280" y2="200" stroke={DARK_BLUE} strokeWidth="8" strokeLinecap="round"/>
  </svg>
);

// 2. Capsule — two-tone pill
export const CapsuleIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="100" y="130" width="200" height="140" rx="70" fill={WHITE}/>
    <path d="M100 200h200" stroke={DARK_BLUE} strokeWidth="6"/>
    <path d="M100 130v70a70 70 0 0 0 200 0v-70Z" fill={BLUE} fillOpacity="0.35"/>
  </svg>
);

// 3. Syrup Bottle — from reference #2
export const SyrupBottleIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <path d="M170 120h60a30 30 0 0 1 30 30v185H140V150a30 30 0 0 1 30-30Z" fill={LIGHT_BLUE}/>
    <rect x="175" y="105" width="50" height="32" rx="4" fill={DARK_BLUE}/>
    <path d="M170 137a30 30 0 0 0-30 30v135h120V167a30 30 0 0 0-30-30" fill="none" stroke={DARK_BLUE} strokeWidth="8" strokeLinejoin="round"/>
    <rect x="145" y="190" width="110" height="65" fill={WHITE} rx="4"/>
    <line x1="160" y1="215" x2="240" y2="215" stroke={BLUE} strokeWidth="5" strokeLinecap="round"/>
    <line x1="160" y1="235" x2="230" y2="235" stroke={BLUE} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

// 4. Injection Vial
export const InjectionVialIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="160" y="180" width="80" height="140" rx="15" fill={LIGHT_BLUE}/>
    <rect x="165" y="140" width="70" height="45" rx="8" fill={BLUE}/>
    <rect x="175" y="125" width="50" height="20" rx="5" fill={DARK_BLUE}/>
    <circle cx="200" cy="135" r="4" fill={WHITE}/>
    <line x1="200" y1="125" x2="200" y2="110" stroke={DARK_BLUE} strokeWidth="6" strokeLinecap="round"/>
    <circle cx="200" cy="105" r="8" fill={BLUE}/>
    <line x1="175" y1="220" x2="225" y2="220" stroke={BLUE} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

// 5. IV Infusion Bag — from reference #3
export const IVInfusionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <path d="M170 105h60v25a70 70 0 0 1 70 70v130H100V200a70 70 0 0 1 70-70V105Z" fill={BLUE}/>
    <rect x="155" y="190" width="90" height="65" fill={WHITE} rx="4"/>
    <path d="M240 155a35 35 0 0 1 13 20" fill="none" stroke={WHITE} strokeWidth="5" strokeLinecap="round"/>
    <line x1="170" y1="215" x2="230" y2="215" stroke={BLUE} strokeWidth="5" strokeLinecap="round"/>
    <line x1="170" y1="235" x2="220" y2="235" stroke={BLUE} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

// 6. Cream Tube
export const CreamTubeIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <path d="M165 100h70v210a20 20 0 0 1-20 20h-30a20 20 0 0 1-20-20V100Z" fill={WHITE}/>
    <path d="M165 100h70v210a20 20 0 0 1-20 20h-30a20 20 0 0 1-20-20V100Z" fill={LIGHT_BLUE} fillOpacity="0.5"/>
    <rect x="155" y="310" width="90" height="20" rx="8" fill={DARK_BLUE}/>
    <rect x="160" y="90" width="80" height="15" rx="4" fill={BLUE}/>
    <line x1="200" y1="150" x2="200" y2="290" stroke={DARK_BLUE} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

// 7. Eye Drop
export const EyeDropIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="170" y="160" width="60" height="130" rx="12" fill={LIGHT_BLUE}/>
    <path d="M175 120l25-25 25 25" stroke={DARK_BLUE} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="200" y1="95" x2="200" y2="160" stroke={DARK_BLUE} strokeWidth="7" strokeLinecap="round"/>
    <circle cx="200" cy="215" r="14" fill={BLUE}/>
    <circle cx="200" cy="215" r="7" fill={WHITE}/>
    <path d="M170 215a30 30 0 0 0 60 0" fill="none" stroke={DARK_BLUE} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

// 8. Ointment Jar
export const OintmentIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="140" y="140" width="120" height="170" rx="20" fill={WHITE}/>
    <rect x="140" y="140" width="120" height="170" rx="20" fill={LIGHT_BLUE} fillOpacity="0.5"/>
    <rect x="135" y="120" width="130" height="30" rx="8" fill={DARK_BLUE}/>
    <rect x="150" y="108" width="100" height="18" rx="5" fill={BLUE}/>
    <line x1="200" y1="180" x2="200" y2="270" stroke={DARK_BLUE} strokeWidth="5" strokeLinecap="round"/>
    <line x1="170" y1="225" x2="230" y2="225" stroke={DARK_BLUE} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

// 9. Gel Tube
export const GelIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <path d="M165 110h70v180a20 20 0 0 1-20 20h-30a20 20 0 0 1-20-20V110Z" fill={LIGHT_BLUE}/>
    <rect x="160" y="100" width="80" height="15" rx="4" fill={DARK_BLUE}/>
    <circle cx="190" cy="160" r="10" fill={BLUE} opacity="0.6"/>
    <circle cx="210" cy="190" r="8" fill={BLUE} opacity="0.5"/>
    <circle cx="195" cy="230" r="7" fill={BLUE} opacity="0.4"/>
    <circle cx="215" cy="260" r="6" fill={BLUE} opacity="0.3"/>
  </svg>
);

// 10. Suspension
export const SuspensionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="155" y="115" width="90" height="190" rx="15" fill={LIGHT_BLUE}/>
    <rect x="162" y="100" width="76" height="22" rx="5" fill={DARK_BLUE}/>
    <circle cx="185" cy="170" r="9" fill={BLUE}/>
    <circle cx="210" cy="200" r="7" fill={BLUE}/>
    <circle cx="190" cy="240" r="6" fill={BLUE}/>
    <circle cx="215" cy="170" r="6" fill={BLUE} opacity="0.7"/>
  </svg>
);

// 11. Suppository
export const SuppositoryIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <ellipse cx="200" cy="210" rx="60" ry="110" fill={WHITE}/>
    <ellipse cx="200" cy="210" rx="60" ry="110" fill={LIGHT_BLUE} fillOpacity="0.5"/>
    <ellipse cx="200" cy="140" rx="35" ry="25" fill={BLUE} opacity="0.4"/>
    <line x1="200" y1="100" x2="200" y2="115" stroke={DARK_BLUE} strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

// 12. Nasal Spray
export const NasalSprayIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="165" y="165" width="70" height="140" rx="12" fill={LIGHT_BLUE}/>
    <path d="M172 135l28-40 28 40" stroke={DARK_BLUE} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M170 135l-12 30h84l-12-30" stroke={DARK_BLUE} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="195" cy="210" r="5" fill={BLUE} opacity="0.6"/>
    <circle cx="205" cy="240" r="4" fill={BLUE} opacity="0.4"/>
  </svg>
);

// 13. Chewable Tablet
export const ChewableTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <ellipse cx="200" cy="210" rx="130" ry="95" fill={LIGHT_BLUE}/>
    <ellipse cx="200" cy="205" rx="130" ry="95" fill={WHITE}/>
    <path d="M155 195l25 25 65-65" stroke={DARK_BLUE} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="120" y1="210" x2="280" y2="210" stroke={BLUE} strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

// 14. Bolus
export const BolusIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="100" y="150" width="200" height="100" rx="25" fill={WHITE}/>
    <rect x="100" y="150" width="200" height="100" rx="25" fill={LIGHT_BLUE} fillOpacity="0.4"/>
    <line x1="100" y1="200" x2="300" y2="200" stroke={DARK_BLUE} strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

// 15. Powder
export const PowderIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="130" y="150" width="140" height="170" rx="15" fill={WHITE}/>
    <rect x="130" y="150" width="140" height="170" rx="15" fill={LIGHT_BLUE} fillOpacity="0.4"/>
    <rect x="135" y="130" width="130" height="25" rx="6" fill={BLUE}/>
    <circle cx="175" cy="200" r="7" fill={DARK_BLUE} opacity="0.5"/>
    <circle cx="205" cy="230" r="6" fill={DARK_BLUE} opacity="0.4"/>
    <circle cx="190" cy="270" r="5" fill={DARK_BLUE} opacity="0.3"/>
    <circle cx="220" cy="200" r="5" fill={DARK_BLUE} opacity="0.3"/>
  </svg>
);

// 16. Solution
export const SolutionIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="155" y="120" width="90" height="190" rx="15" fill={LIGHT_BLUE}/>
    <rect x="162" y="100" width="76" height="25" rx="5" fill={DARK_BLUE}/>
    <line x1="175" y1="170" x2="225" y2="170" stroke={BLUE} strokeWidth="5" strokeLinecap="round"/>
    <line x1="175" y1="195" x2="225" y2="195" stroke={BLUE} strokeWidth="5" strokeLinecap="round"/>
    <line x1="175" y1="220" x2="215" y2="220" stroke={BLUE} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

// 17. XR Extended Release Tablet
export const XRTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <ellipse cx="200" cy="210" rx="130" ry="95" fill={LIGHT_BLUE}/>
    <ellipse cx="200" cy="205" rx="130" ry="95" fill={WHITE}/>
    <line x1="120" y1="210" x2="280" y2="210" stroke={DARK_BLUE} strokeWidth="7" strokeLinecap="round"/>
    <circle cx="200" cy="210" r="35" fill="none" stroke={BLUE} strokeWidth="8"/>
    <line x1="200" y1="210" x2="200" y2="175" stroke={BLUE} strokeWidth="7" strokeLinecap="round"/>
    <line x1="200" y1="210" x2="225" y2="205" stroke={BLUE} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

// 18. Enteric Coated Tablet
export const EntericTabletIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <ellipse cx="200" cy="210" rx="130" ry="95" fill={WHITE}/>
    <ellipse cx="200" cy="210" rx="100" ry="70" fill={LIGHT_BLUE} fillOpacity="0.6"/>
    <ellipse cx="200" cy="210" rx="100" ry="70" fill="none" stroke={BLUE} strokeWidth="7" strokeDasharray="20 12"/>
    <line x1="120" y1="210" x2="280" y2="210" stroke={DARK_BLUE} strokeWidth="7" strokeLinecap="round"/>
  </svg>
);

// 19. Inhaler device
export const InhalerIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="110" y="160" width="180" height="90" rx="12" fill={WHITE}/>
    <rect x="110" y="160" width="180" height="90" rx="12" fill={LIGHT_BLUE} fillOpacity="0.4}/>
    <rect x="115" y="140" width="60" height="30" rx="5" fill={BLUE}/>
    <line x1="175" y1="205" x2="270" y2="205" stroke={DARK_BLUE} strokeWidth="7" strokeLinecap="round"/>
  </svg>
);

// 20. Paediatric Drops
export const PaediatricDropsIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="175" y="155" width="50" height="130" rx="10" fill={LIGHT_BLUE}/>
    <path d="M180 130l20-25 20 25" stroke={DARK_BLUE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="200" cy="145" r="5" fill={BLUE}/>
    <circle cx="197" cy="200" r="5" fill={DARK_BLUE} opacity="0.6"/>
    <circle cx="200" cy="230" r="4" fill={DARK_BLUE} opacity="0.4"/>
    <circle cx="203" cy="250" r="3" fill={BLUE} opacity="0.3"/>
  </svg>
);

// 21. Pill (generic fallback)
export const PillIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className} {...props}>
    <rect x="100" y="130" width="200" height="140" rx="70" fill={WHITE}/>
    <path d="M100 200h200" stroke={DARK_BLUE} strokeWidth="6"/>
    <path d="M100 130v70a70 70 0 0 0 200 0v-70Z" fill={BLUE} fillOpacity="0.35"/>
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
