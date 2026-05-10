import React from 'react';

type IconFn = React.FC<React.ImgHTMLAttributes<HTMLImageElement> & { className?: string }>;

const Img = (src: string): IconFn => ({ className, ...props }) => (
  <img src={src} alt="" className={className} {...props} />
);

export const TabletIcon = Img('/icons/tablet.svg');
export const CapsuleIcon = Img('/icons/capsule.svg');
export const BottleIcon = Img('/icons/bottle.svg');
export const InjectionIcon = Img('/icons/injection.svg');
export const CreamIcon = Img('/icons/cream.svg');
export const OintmentIcon = Img('/icons/ointment.svg');
export const SprayIcon = Img('/icons/spray.svg');
export const DropIcon = Img('/icons/drop.svg');
export const EyeDropperIcon = Img('/icons/eyedropper.svg');
export const PowderIcon = Img('/icons/powder.svg');
export const InhalerIcon = Img('/icons/inhaler.svg');
export const PillIcon = Img('/icons/pill.svg');
export const HerbalIcon = Img('/icons/herbal.svg');
export const SuppositoryIcon = Img('/icons/suppository.svg');

const iconMap: Record<string, IconFn> = {
  tablet: TabletIcon,
  capsule: CapsuleIcon,
  'capsule (enteric coated)': CapsuleIcon,
  injection: InjectionIcon,
  'im injection': InjectionIcon,
  'iv injection': InjectionIcon,
  'iv infusion': InjectionIcon,
  'iv/im injection': InjectionIcon,
  'im/iv injection': InjectionIcon,
  syrup: BottleIcon,
  'powder for suspension': BottleIcon,
  suspension: BottleIcon,
  'oral suspension': BottleIcon,
  cream: CreamIcon,
  ointment: OintmentIcon,
  gel: CreamIcon,
  'eye drops': EyeDropperIcon,
  'ophthalmic solution': EyeDropperIcon,
  'paediatric drops': DropIcon,
  'nasal spray': SprayIcon,
  bolus: TabletIcon,
  powder: PowderIcon,
  'oral solution': BottleIcon,
  solution: BottleIcon,
  'tablet (extended release)': TabletIcon,
  'xr tablet': TabletIcon,
  'tablet (enteric coated)': TabletIcon,
  'chewable tablet': TabletIcon,
  suppository: SuppositoryIcon,
  inhaler: InhalerIcon,
  'inhalation capsule': InhalerIcon,
  herbal: HerbalIcon,
};

export function getDosageIcon(form: string): IconFn {
  const key = (form || '').toLowerCase().trim();
  return iconMap[key] || TabletIcon;
}
