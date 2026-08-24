import {prepareShareMessage} from '../api/product';
import {getWebApp} from './telegram';

const shareFallback = async (text) => {
    if (!text) return false;

    if (typeof navigator.share === 'function') {
        try {
            await navigator.share({text});
            return true;
        } catch (error) {
            if (error?.name === 'AbortError') return false;
        }
    }

    return copyText(text);
};

export const copyText = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('[share] clipboard:', error.message);
        return false;
    }
};

export const shareProduct = async ({productId, userId, text}) => {
    const tg = getWebApp();

    if (typeof tg?.shareMessage !== 'function' || !userId) {
        return shareFallback(text);
    }

    try {
        const messageId = await prepareShareMessage(productId, userId);
        if (!messageId) return shareFallback(text);

        tg.shareMessage(messageId);
        return true;
    } catch (error) {
        console.error('[share] prepare:', error.message);
        return shareFallback(text);
    }
};
