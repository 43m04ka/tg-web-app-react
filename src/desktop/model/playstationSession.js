export const PLAYSTATION_SESSION_KEY = 'desktop:playstation-region';

const TYPES = new Set(['ps', 'ps_india']);

export const readPlayStationRegion = () => {
    try {
        const type = window.sessionStorage.getItem(PLAYSTATION_SESSION_KEY);
        return TYPES.has(type) ? type : null;
    } catch {
        return null;
    }
};

export const rememberPlayStationRegion = (type) => {
    if (!TYPES.has(type)) return;
    try {
        window.sessionStorage.setItem(PLAYSTATION_SESSION_KEY, type);
    } catch {}
};
