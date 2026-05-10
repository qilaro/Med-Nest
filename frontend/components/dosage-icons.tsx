import React from 'react';

type IconProps = React.ImgHTMLAttributes<HTMLImageElement> & { className?: string };
type IconFn = React.FC<IconProps>;

export const TabletIcon: IconFn = ({ className, ...props }) => (
  <img src="/icons/tablet.svg" alt="tablet" className={className} {...props} />
);
export const CapsuleIcon: IconFn = ({ className, ...props }) => (
  <img src="/icons/capsule.svg" alt="capsule" className={className} {...props} />
);
export const SyrupBottleIcon: IconFn = ({ className, ...props }) => (
  <img src="/icons/bottle.svg" alt="bottle" className={className} {...props} />
);
export const InjectionVialIcon: IconFn = ({ className, ...props }) => (
  <img src="/icons/injection.svg" alt="injection" className={className} {...props} />
);
export const EyeDropIcon: IconFn = ({ className, ...props }) => (
  <img src="/icons/drop.svg" alt="drop" className={className} {...props} />
);
export const HerbalIcon: IconFn = ({ className, ...props }) => (
  <img src="/icons/herbal.svg" alt="herbal" className={className} {...props} />
);
export const PillIcon: IconFn = ({ className, ...props }) => (
  <img src="/icons/pill.svg" alt="pill" className={className} {...props} />
);
export const CreamTubeIcon = SyrupBottleIcon;
export const OintmentIcon = TabletIcon;
export const GelIcon = TabletIcon;
export const SuspensionIcon = SyrupBottleIcon;
export const SuppositoryIcon = CapsuleIcon;
export const NasalSprayIcon = SyrupBottleIcon;
export const ChewableTabletIcon = TabletIcon;
export const BolusIcon = TabletIcon;
export const PowderIcon = TabletIcon;
export const SolutionIcon = SyrupBottleIcon;
export const XRTabletIcon = TabletIcon;
export const EntericTabletIcon = TabletIcon;
export const InhalerIcon = SyrupBottleIcon;
export const PaediatricDropsIcon = EyeDropIcon;
export const IVInfusionIcon = InjectionVialIcon;

const iconMap: Record<string, IconFn> = {
  tablet: TabletIcon,
  capsule: CapsuleIcon,
  'capsule (enteric coated)': CapsuleIcon,
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
  herbal: HerbalIcon,
};

export function getDosageIcon(form: string): IconFn {
  const key = (form || '').toLowerCase().trim();
  return iconMap[key] || TabletIcon;
}
