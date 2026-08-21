const DEFAULT_ACCENT = '#c0553f';

const srgbToLinear = (channel) =>
    channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);

const parseHex = (hex) => {
    const clean = String(hex).replace('#', '').trim();
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

    return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16) / 255);
};

const toOklch = (hex) => {
    const rgb = parseHex(hex);
    if (!rgb) return null;

    const [r, g, b] = rgb.map(srgbToLinear);

    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

    const lightness = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

    const hue = (Math.atan2(bb, a) * 180) / Math.PI;

    return {
        lightness,
        chroma: Math.sqrt(a * a + bb * bb),
        hue: hue < 0 ? hue + 360 : hue
    };
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const round = (value) => Math.round(value * 1000) / 1000;

export const accentStyle = (color) => {
    const source = toOklch(color) || toOklch(DEFAULT_ACCENT);

    const hue = round(source.hue);
    const chroma = clamp(source.chroma, 0.05, 0.19);
    const topLightness = round(clamp(0.3 + (source.lightness - 0.55) * 0.55, 0.28, 0.44));

    const oklch = (lightness, chromaFactor, alpha) =>
        `oklch(${lightness} ${round(chroma * chromaFactor)} ${hue}${alpha ? ` / ${alpha}` : ''})`;

    return {
        '--card-gradient': `linear-gradient(120deg, ${oklch(topLightness, 0.62)} 0%, ${oklch(0.175, 0.2)} 100%)`,
        '--card-ring': oklch(0.66, 0.85),
        '--card-badge': oklch(0.32, 0.55),
        '--card-border': oklch(0.62, 1, 0.25),
        '--card-arrow': oklch(0.76, 0.62)
    };
};
