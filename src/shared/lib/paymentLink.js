import {getWebApp} from './telegram';

export const openPaymentLink = (url) => {
    if (!url) return false;

    const tg = getWebApp();
    if (tg && typeof tg.openLink === 'function') {
        tg.openLink(url);
        return true;
    }

    const opened = window.open(url, '_blank');
    if (!opened) return false;

    try {
        opened.opener = null;
    } catch (e) {
    }

    return true;
};
