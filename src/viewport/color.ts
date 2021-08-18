export interface RGB {
  r: number,
  g: number,
  b: number,
}

export enum RGBComponent {
  R = 'r',
  G = 'g',
  B = 'b',
}

export function isValidRGB(color: RGB): boolean {
  return color.r >= 0 && color.r <= 1 &&
    color.g >= 0 && color.g <= 1 &&
    color.b >= 0 && color.b <= 1;
}

export interface HSV {
  h: number,
  s: number,
  v: number,
}

export enum HSVComponent {
  H = 'h',
  S = 's',
  V = 'v',
}

export function isValidHSV(color: HSV): boolean {
  return color.h >= 0 && color.h < 1 &&
    color.s >= 0 && color.s <= 1 &&
    color.v >= 0 && color.v <= 1;
}

function getRGBToHSVIntermediates(src: RGB) {
  let [cMin, cMinComponent]: [number, RGBComponent] = [src.r, RGBComponent.R];
  let [cMax, cMaxComponent]: [number, RGBComponent] = [src.r, RGBComponent.R];
  if (src.g < cMin) [cMin, cMinComponent] = [src.g, RGBComponent.G];
  if (src.g > cMax) [cMax, cMaxComponent] = [src.g, RGBComponent.G];
  if (src.b < cMin) [cMin, cMinComponent] = [src.b, RGBComponent.B];
  if (src.b > cMax) [cMax, cMaxComponent] = [src.b, RGBComponent.B];

  return {
    r: src.r,
    g: src.g,
    b: src.b,
    cMin,
    cMinComponent,
    cMax,
    cMaxComponent,
    delta: cMax - cMin,
  };
}

function getHFromIntermediates(intermediates: ReturnType<typeof getRGBToHSVIntermediates>): number {
  if (intermediates.delta == 0) return 0;
  if (intermediates.cMaxComponent == RGBComponent.R) {
    const t = (intermediates.g - intermediates.b) / intermediates.delta / 6;
    return t - Math.floor(t);
  } else if (intermediates.cMaxComponent == RGBComponent.G) {
    return ((intermediates.b - intermediates.r) / intermediates.delta + 2) / 6;
  } else {
    return ((intermediates.r - intermediates.g) / intermediates.delta + 4) / 6;
  }
}

export function RGBToHSV(src: RGB): HSV {
  const intermediates = getRGBToHSVIntermediates(src);
  return {
    h: getHFromIntermediates(intermediates),
    s: intermediates.cMax == 0 ? 0 : intermediates.delta / intermediates.cMax,
    v: intermediates.cMax,
  };
}

export function HSVToRGB(src: HSV): RGB {
  const k = (n: number) => {
    const t = n + 6 * src.h;
    return t - 6 * Math.floor(t / 6);
  };
  const f = (n: number) => {
    const K = k(n);
    return src.v - src.v * src.s *Math.max(0, Math.min(K, 4 - K, 1));
  };
  return {
    r: f(5),
    g: f(3),
    b: f(1),
  };
}

export function RGBToString(src: RGB): string {
  const [r, g, b] = [Math.floor(src.r * 255), Math.floor(src.g * 255), Math.floor(src.b * 255)];
  return `rgb(${r}, ${g}, ${b})`;
}