/**
 * Color del sidebar a partir del fondo del logo: se promedia el borde de la imagen
 * (donde suele verse el color de fondo). PNG transparente se compone sobre blanco.
 * Si falla CORS o la imagen, se usa el fallback.
 */

const FALLBACK_BG = "#02101d";

export type SidebarColorsFromLogo = {
  background: string;
  foreground: string;
  muted: string;
  hoverBg: string;
  border: string;
  isDarkBackground: boolean;
};

export const DEFAULT_SIDEBAR_COLORS: SidebarColorsFromLogo = {
  background: FALLBACK_BG,
  foreground: "#f3f4f6",
  muted: "rgba(255,255,255,0.55)",
  hoverBg: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.12)",
  isDarkBackground: true,
};

function relativeLuminance(r: number, g: number, b: number): number {
  const srgb = [r, g, b].map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function mixRgb(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
  t: number,
): [number, number, number] {
  return [
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t),
  ];
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = url;
  });
}

/**
 * RGB promedio en el marco exterior (~10 % del borde): típico del color de fondo del arte.
 */
function sampleEdgeBackgroundRgb(
  data: Uint8ClampedArray,
  w: number,
  h: number,
): [number, number, number] | null {
  const margin = Math.max(2, Math.round(Math.min(w, h) * 0.1));
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const onEdge =
        x < margin || x >= w - margin || y < margin || y >= h - margin;
      if (!onEdge) continue;
      const i = (y * w + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  if (n < 1) return null;
  return [r / n, g / n, b / n];
}

/**
 * Respaldo: promedio de píxeles poco saturados en toda la imagen (grandes planos de fondo).
 */
function sampleLowSaturationBackgroundRgb(
  data: Uint8ClampedArray,
  w: number,
  h: number,
): [number, number, number] | null {
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const R = data[i] / 255;
      const G = data[i + 1] / 255;
      const B = data[i + 2] / 255;
      const max = Math.max(R, G, B);
      const min = Math.min(R, G, B);
      const l = (max + min) / 2;
      const sat =
        max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1) + 0.001);
      if (sat > 0.2) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  if (n < 8) return null;
  return [r / n, g / n, b / n];
}

/**
 * Deriva colores del sidebar a partir de la URL del logo.
 */
export async function getSidebarColorsFromLogoUrl(
  url: string | null | undefined,
): Promise<SidebarColorsFromLogo> {
  if (!url?.trim()) return DEFAULT_SIDEBAR_COLORS;

  try {
    const img = await loadImage(url.trim());
    const canvas = document.createElement("canvas");
    const size = 72;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return DEFAULT_SIDEBAR_COLORS;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    let rgb =
      sampleEdgeBackgroundRgb(data, size, size) ??
      sampleLowSaturationBackgroundRgb(data, size, size);
    if (!rgb) return DEFAULT_SIDEBAR_COLORS;

    let r = Math.round(rgb[0]);
    let g = Math.round(rgb[1]);
    let b = Math.round(rgb[2]);
    let lum = relativeLuminance(r, g, b);

    // Negro casi puro: levantar un poco para que haya contraste con texto claro
    if (lum < 0.035) {
      [r, g, b] = mixRgb(r, g, b, 24, 28, 36, 0.35);
      lum = relativeLuminance(r, g, b);
    }

    const background = rgbToHex(r, g, b);
    const isDarkBackground = lum < 0.45;

    if (isDarkBackground) {
      return {
        background,
        foreground: "#f3f4f6",
        muted: "rgba(255,255,255,0.55)",
        hoverBg: "rgba(255,255,255,0.1)",
        border: "rgba(255,255,255,0.14)",
        isDarkBackground: true,
      };
    }

    return {
      background,
      foreground: "#111827",
      muted: "rgba(17,24,39,0.55)",
      hoverBg: "rgba(0,0,0,0.06)",
      border: "rgba(17,24,39,0.12)",
      isDarkBackground: false,
    };
  } catch {
    return DEFAULT_SIDEBAR_COLORS;
  }
}
