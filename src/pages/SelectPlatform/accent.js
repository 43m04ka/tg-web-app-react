import {clamp, round, toOklch} from '../../shared/lib/oklch';

const DEFAULT_ACCENT = '#c0553f';

export const accentStyle = (color) => {
    const source = toOklch(color) || toOklch(DEFAULT_ACCENT);

    const hue = round(source.hue);
    const chroma = clamp(source.chroma, 0.05, 0.19);
    const topLightness = round(clamp(0.4 + (source.lightness - 0.55) * 0.55, 0.37, 0.55));
    const bottomLightness = round(clamp(topLightness - 0.15, 0.21, 0.38));

    const oklch = (lightness, chromaFactor, alpha) =>
        `oklch(${lightness} ${round(chroma * chromaFactor)} ${hue}${alpha ? ` / ${alpha}` : ''})`;

    return {
        '--card-gradient': `linear-gradient(120deg, ${oklch(topLightness, 0.86)} 0%, ${oklch(bottomLightness, 0.3)} 100%)`,
        '--card-ring': oklch(0.7, 0.9),
        '--card-badge': oklch(0.36, 0.6),
        '--card-border': oklch(0.66, 1, 0.32),
        '--card-arrow': oklch(0.8, 0.7)
    };
};

export const glowStyle = (color) => {
    const source = toOklch(color);
    if (!source) return {};

    const chroma = clamp(source.chroma, 0.05, 0.19);

    return {
        backgroundColor: `oklch(0.62 ${round(chroma)} ${round(source.hue)} / 0.15)`
    };
};
