export type ThemeSwatch = {
  name: string;
  light: string;
  dark: string;
};

export const STROKE_SWATCHES: ThemeSwatch[] = [
  { name: "black", light: "#1e1e1e", dark: "#e5e5e5" },
  { name: "red", light: "#ec0025", dark: "#ff5571" },
  { name: "green", light: "#00ad3e", dark: "#4ade80" },
  { name: "blue", light: "#315dc6", dark: "#60a5fa" },
  { name: "orange", light: "#f68c00", dark: "#fdba74" },
];

function isDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function getStrokeSwatches(): { name: string; hex: string }[] {
  const dark = isDarkMode();
  return STROKE_SWATCHES.map(({ name, light, dark: d }) => ({
    name,
    hex: dark ? d : light,
  }));
}

// Stroke palette contrasts with background swatches using opposite shade (same hue)
export const BACKGROUND_SWATCHES: ThemeSwatch[] = [
  { name: "black", light: "transparent", dark: "transparent" },
  { name: "red", light: "#ffc4c8", dark: "#612e32" },
  { name: "green", light: "#9efeb9", dark: "#003e03" },
  { name: "blue", light: "#a4d3ff", dark: "#1b4369" },
  { name: "orange", light: "#fbf692", dark: "#282400" },
];

export function getBackgroundSwatches(): { name: string; hex: string }[] {
  const dark = isDarkMode();
  return BACKGROUND_SWATCHES.map(({ name, light, dark: d }) => ({
    name,
    hex: dark ? d : light,
  }));
}

// Canvas background palette
export const CANVAS_DARK_BG = ["#020618", "#181604", "#1b1715", "#13171b"];
export const CANVAS_LIGHT_BG = ["#ffffff", "#f5faff", "#f8f9fa", "#fffce8"];
export const DEFAULT_DARK_BG = CANVAS_DARK_BG[0];
export const DEFAULT_LIGHT_BG = CANVAS_LIGHT_BG[0];

// Canvas
export const CANVAS_PROTOTYPE_CONFIG = {
  cornerColor: "#FFF",
  cornerStyle: "circle",
  borderColor: "#3b82f6",
  borderScaleFactor: 1.5,
  transparentCorners: false,
  borderOpacityWhenMoving: 1,
  cornerStrokeColor: "#3b82f6",
};
