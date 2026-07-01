export const darkenHex = (hex, factor = 0.18) => {
    const normalized = (hex || '#5B78E3').replace('#', '');
    if (normalized.length !== 6) {
        return '#101010';
    }

    const r = parseInt(normalized.substring(0, 2), 16);
    const g = parseInt(normalized.substring(2, 4), 16);
    const b = parseInt(normalized.substring(4, 6), 16);

    const toHex = (value) => Math.round(value * factor).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const hexToRgb = (hex) => {
    const normalized = (hex || '#5B78E3').replace('#', '');
    if (normalized.length !== 6) {
        return '91, 120, 227';
    }

    const r = parseInt(normalized.substring(0, 2), 16);
    const g = parseInt(normalized.substring(2, 4), 16);
    const b = parseInt(normalized.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
};

export const mixHex = (hex, targetHex, ratio) => {
    const source = (hex || '#5B78E3').replace('#', '');
    const target = (targetHex || '#0a0a0a').replace('#', '');

    if (source.length !== 6 || target.length !== 6) {
        return '#0a0a0a';
    }

    const mixChannel = (from, to) => Math.round(from + (to - from) * ratio);
    const sr = parseInt(source.substring(0, 2), 16);
    const sg = parseInt(source.substring(2, 4), 16);
    const sb = parseInt(source.substring(4, 6), 16);
    const tr = parseInt(target.substring(0, 2), 16);
    const tg = parseInt(target.substring(2, 4), 16);
    const tb = parseInt(target.substring(4, 6), 16);

    const toHex = (value) => value.toString(16).padStart(2, '0');
    return `#${toHex(mixChannel(sr, tr))}${toHex(mixChannel(sg, tg))}${toHex(mixChannel(sb, tb))}`;
};

export const getPlatformCardStyle = (accentColor) => ({
    '--card-accent': accentColor,
    '--card-accent-rgb': hexToRgb(accentColor),
    '--card-accent-soft': mixHex(accentColor, '#0a0a0a', 0.35),
    '--card-accent-muted': mixHex(accentColor, '#0a0a0a', 0.62),
    '--card-accent-dark': mixHex(accentColor, '#0a0a0a', 0.82),
    '--card-accent-deep': darkenHex(accentColor, 0.12),
});
