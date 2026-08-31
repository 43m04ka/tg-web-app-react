import {prepareShareMessage} from '../api/product';
import {getWebApp} from './telegram';

const SHARE_MESSAGE_VERSION = '8.0';

const shareUrl = (link, text) =>
    `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;

const supportsShareMessage = (tg) =>
    typeof tg?.shareMessage === 'function' && tg.isVersionAtLeast?.(SHARE_MESSAGE_VERSION) === true;

const sendPrepared = (tg, messageId) => new Promise((resolve) => {
    try {
        tg.shareMessage(messageId, (isSent) => resolve(isSent === true ? 'sent' : 'cancelled'));
    } catch (error) {
        console.error('[share] shareMessage:', error.message);
        resolve(null);
    }
});

export const copyText = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('[share] clipboard:', error.message);
        return false;
    }
};

export const shareProduct = async ({productId, userId, text, link}) => {
    const tg = getWebApp();

    if (userId && supportsShareMessage(tg)) {
        const messageId = await prepareShareMessage(productId, userId).catch((error) => {
            console.error('[share] prepare:', error.message);
            return null;
        });

        if (messageId) {
            const outcome = await sendPrepared(tg, messageId);
            if (outcome) return outcome;
        }
    }

    if (link && typeof tg?.openTelegramLink === 'function') {
        tg.openTelegramLink(shareUrl(link, text));
        return 'cancelled';
    }

    if (text && typeof navigator.share === 'function') {
        try {
            await navigator.share({text});
            return 'sent';
        } catch (error) {
            if (error?.name === 'AbortError') return 'cancelled';
        }
    }

    return await copyText(text) ? 'copied' : 'failed';
};
