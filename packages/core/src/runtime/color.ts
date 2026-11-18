export type RGB = [number, number, number];

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function fromChannels(r: number, g: number, b: number): RGB {
  return [srgbToLinear(r / 255), srgbToLinear(g / 255), srgbToLinear(b / 255)];
}

function hslToRgbChannels(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.min(Math.max(s, 0), 1);
  const light = Math.min(Math.max(l, 0), 1);

  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/** Parses a hex, rgb()/rgba(), or hsl()/hsla() color string into a linear-light [r,g,b] triple in 0..1. */
export function parseColor(input: string): RGB {
  const value = input.trim();

  const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  const hex = hexMatch?.[1];
  if (hex) {
    if (hex.length === 3) {
      const r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      const g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      const b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
      return fromChannels(r, g, b);
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return fromChannels(r, g, b);
  }

  const rgbMatch = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(value);
  if (rgbMatch) {
    return fromChannels(Number(rgbMatch[1] ?? 0), Number(rgbMatch[2] ?? 0), Number(rgbMatch[3] ?? 0));
  }

  const hslMatch = /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/i.exec(value);
  if (hslMatch) {
    const [r, g, b] = hslToRgbChannels(
      Number(hslMatch[1] ?? 0),
      Number(hslMatch[2] ?? 0) / 100,
      Number(hslMatch[3] ?? 0) / 100,
    );
    return fromChannels(r, g, b);
  }

  return [0, 0, 0];
}

export function parseColors(inputs: readonly string[]): RGB[] {
  return inputs.map(parseColor);
}
