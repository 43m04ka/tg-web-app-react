import {
    ADMIN_API_URL,
    adminAuthHeadersJson,
    adminBearerHeaders,
    hasAdminBearer,
    withJsonAuth,
} from '../../adminAuth';

/**
 * POST /api/admin/broadcast/tg/stats
 * @returns {Promise<object>}
 */
export const fetchBroadcastStats = async (authenticationData) => {
    const res = await fetch(`${ADMIN_API_URL}/broadcast/tg/stats`, {
        method: 'POST',
        headers: adminAuthHeadersJson(),
        body: JSON.stringify(withJsonAuth({authenticationData})),
    });
    let data = {};
    try {
        data = await res.json();
    } catch {
        /* ignore */
    }
    if (!res.ok) {
        const msg = data.message || data.error || `Ошибка ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    }
    return data;
};

/**
 * POST /api/admin/broadcast/tg/send (multipart)
 * @returns {Promise<{ ok: boolean, status: number, data: object }>}
 */
export const postBroadcastSend = async (authenticationData, payload) => {
    const form = new FormData();
    if (!hasAdminBearer() && authenticationData) {
        form.append(
            'authenticationData',
            JSON.stringify({
                login: authenticationData.login,
                password: authenticationData.password,
            }),
        );
    }
    form.append('mode', payload.mode);
    form.append('text', payload.text);
    if (payload.disableWebPagePreview) {
        form.append('disableWebPagePreview', 'true');
    }
    if (payload.mediaFile) {
        form.append('media', payload.mediaFile);
    }
    if (payload.inlineKeyboardJson != null && payload.inlineKeyboardJson !== '') {
        form.append('inlineKeyboard', payload.inlineKeyboardJson);
    }

    const res = await fetch(`${ADMIN_API_URL}/broadcast/tg/send`, {
        method: 'POST',
        headers: adminBearerHeaders(),
        body: form,
    });

    let data = {};
    try {
        data = await res.json();
    } catch {
        /* ignore */
    }
    return {ok: res.ok, status: res.status, data};
};
