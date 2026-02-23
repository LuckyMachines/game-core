// Shared SVG tool icon definitions — used by ToolTray and SectionTools

// Torsion Wrench — L-shaped
export const TorsionWrenchIcon = (props) => (
  <svg {...props} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M4 4v12" />
    <path d="M4 4h8" />
  </svg>
);

// Rake — wavy pick
export const RakeIcon = (props) => (
  <svg {...props} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 16L3 8" />
    <path d="M3 8Q6 4 9 8Q12 4 15 8" />
  </svg>
);

// Probe — straight with hook
export const ProbeIcon = (props) => (
  <svg {...props} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M5 16V6" />
    <path d="M5 6Q5 3 8 3" />
  </svg>
);

// Shim — flat blade
export const ShimIcon = (props) => (
  <svg {...props} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 16V5L10 3L14 5V8L6 8" />
  </svg>
);

// Pick Gun — pistol shape
export const PickGunIcon = (props) => (
  <svg {...props} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10l2-2" />
    <path d="M7 8v6" />
    <path d="M10 8v4" />
  </svg>
);

export const TOOL_ICONS = [
  TorsionWrenchIcon,
  RakeIcon,
  ProbeIcon,
  ShimIcon,
  PickGunIcon,
];
