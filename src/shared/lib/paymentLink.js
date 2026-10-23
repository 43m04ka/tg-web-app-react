import {getWebApp} from './telegram';
import {isVkApp} from './platform';

export const paysInVkChat = () => isVkApp();

export const VK_CHAT_NEEDS_MESSAGES = 'Разрешите сообщения от сообщества — ссылка на оплату придёт туда. Нажмите кнопку ещё раз.';

export const VK_CHAT_SCREEN = {
    vk: {
        lead: 'Ссылка на оплату отправлена вам в сообщения от сообщества — откройте её там',
        text: 'Ссылка на оплату отправлена вам в сообщения от сообщества. Как только банк подтвердит перевод, статус обновится сам — эту страницу закрывать не нужно.',
        button: 'Открыть сообщения'
    },
    vk_failed: {
        lead: 'Не получилось отправить ссылку в сообщения — напишите нам в сообщество, пришлём ссылку на оплату',
        text: 'Не получилось отправить ссылку в сообщения. Напишите нам в сообщество — пришлём ссылку на оплату.',
        button: 'Написать в сообщество'
    }
};

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
