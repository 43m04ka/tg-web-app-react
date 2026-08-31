import {clamp, round, toOklch} from './oklch';

const RAMP = {
    '--accent': {lightness: 0.7, chroma: 1, hue: 0},
    '--accent-hover': {lightness: 0.76, chroma: 0.966, hue: 0},
    '--accent-soft': {lightness: 0.42, chroma: 0.724, hue: -5},
    '--accent-surface': {lightness: 0.2, chroma: 0.31, hue: 0},
    '--accent-text': {lightness: 0.81, chroma: 0.69, hue: 1},
    '--accent-contrast': {lightness: 0.99, chroma: 0.028, hue: 0}
};

const VARIABLES = Object.keys(RAMP);

export const applyTheme = (color) => {
    const root = document.documentElement;
    const source = toOklch(color);

    if (!source) {
        VARIABLES.forEach((name) => root.style.removeProperty(name));
        return;
    }

    const hue = source.hue;
    const chroma = clamp(source.chroma, 0.05, 0.19);

    VARIABLES.forEach((name) => {
        const step = RAMP[name];
        const value = `oklch(${step.lightness} ${round(chroma * step.chroma)} ${round(hue + step.hue)})`;
        root.style.setProperty(name, value);
    });
};
