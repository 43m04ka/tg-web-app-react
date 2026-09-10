import {http, httpPost} from '../../platform/http';

export const fetchBroadcastStats = () => httpPost('/broadcast/tg/stats', {});

export const sendBroadcast = ({mode, text, media, keyboard, disablePreview, scheduledAt}) => {
    const form = new FormData();

    form.append('mode', mode);
    form.append('text', text);
    form.append('disableWebPagePreview', disablePreview ? 'true' : 'false');

    if (media) form.append('media', media);
    if (keyboard) form.append('inlineKeyboard', JSON.stringify(keyboard));
    if (scheduledAt) form.append('scheduledAt', new Date(scheduledAt).toISOString());

    return http('/broadcast/tg/send', {method: 'POST', form, timeoutMs: 120000});
};
