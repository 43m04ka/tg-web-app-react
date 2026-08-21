const DEFAULT_ACCENT = '#c0553f';

export const accentStyle = (color) => {
    const accent = color || DEFAULT_ACCENT;

    return {
        '--card-accent': accent,
        '--card-gradient': `linear-gradient(120deg,
            color-mix(in oklab, ${accent} 34%, oklch(0.16 0.02 264)) 0%,
            color-mix(in oklab, ${accent} 10%, oklch(0.14 0.014 264)) 100%)`,
        '--card-ring': `color-mix(in oklab, ${accent} 72%, white 8%)`,
        '--card-badge': `color-mix(in oklab, ${accent} 20%, transparent)`
    };
};
