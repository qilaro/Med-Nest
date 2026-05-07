import React, { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const IconWrapper = ({ size = 20, children, ...props }: IconProps & { children: React.ReactNode }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {children}
  </svg>
);

// High-fidelity, distinct icons for Med-Nest
export const TabletIcon = (props: IconProps) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20M2 12h20" strokeWidth="1.5" />
  </IconWrapper>
);

export const CapsuleIcon = (props: IconProps) => (
  <IconWrapper {...props}>
    <path d="M12 2a6 6 0 0 0-6 6v8a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6Z" />
    <path d="M12 2v20" />
  </IconWrapper>
);

export const SyrupIcon = (props: IconProps) => (
  <IconWrapper {...props}>
    <path d="M9 2h6v4H9z" />
    <path d="M8 6h8v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6z" />
  </IconWrapper>
);

export const SyringeIcon = (props: IconProps) => (
  <IconWrapper {...props}>
    <path d="M18 6l4 4-2 2-4-4z" />
    <path d="M18 6L9 15" />
    <path d="M8 16L3 21" />
  </IconWrapper>
);

export const DropsIcon = (props: IconProps) => (
  <IconWrapper {...props}>
    <path d="M12 22C8.13 22 5 18.87 5 15c0-3.33 3.33-7.5 7-11 3.67 3.5 7 7.67 7 11 0 3.87-3.13 7-7 7z" />
  </IconWrapper>
);

export const SachetIcon = (props: IconProps) => (
  <IconWrapper {...props}>
    <path d="M4 4h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" />
    <path d="M4 4l16 16" />
  </IconWrapper>
);

export const InhalerIcon = (props: IconProps) => (
  <IconWrapper {...props}>
    <rect x="7" y="2" width="10" height="7" rx="1" />
    <path d="M8 9h8v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9z" />
  </IconWrapper>
);

export const PillIcon = CapsuleIcon;
export const IVDripIcon = SyringeIcon;
