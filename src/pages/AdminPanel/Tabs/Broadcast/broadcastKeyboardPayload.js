/** Длина строки в байтах UTF-8 (для callback_data ≤ 64). */
export const utf8ByteLength = (str) => new TextEncoder().encode(str).length;

const TEXT_MIN = 1;
const TEXT_MAX = 256;
const URL_MAX = 2048;

/**
 * Один элемент UI → объект кнопки Bot API или null, если не заполнено.
 */
export const buttonDraftToApi = (btn) => {
    const text = (btn.text || '').trim();
    if (text.length < TEXT_MIN || text.length > TEXT_MAX) return null;

    switch (btn.actionType) {
        case 'url': {
            const u = (btn.url || '').trim();
            if (!u || u.length > URL_MAX) return null;
            if (!/^(https?:\/\/|tg:\/\/)/i.test(u)) return null;
            return {text, url: u};
        }
        case 'callback_data': {
            const c = (btn.callback_data || '').trim();
            if (!c) return null;
            if (utf8ByteLength(c) > 64) return null;
            return {text, callback_data: c};
        }
        case 'web_app': {
            const u = (btn.webAppUrl || '').trim();
            if (!u || !/^https:\/\//i.test(u)) return null;
            return {text, web_app: {url: u}};
        }
        case 'switch_inline_query':
            return {text, switch_inline_query: btn.switch_inline_query != null ? String(btn.switch_inline_query) : ''};
        case 'switch_inline_query_current_chat': {
            const v = btn.switch_inline_query_current_chat != null ? String(btn.switch_inline_query_current_chat) : '';
            return {text, switch_inline_query_current_chat: v};
        }
        default:
            return null;
    }
};

/**
 * @param {Array<{ id: string, buttons: object[] }>} keyboardRows
 * @returns {Array<Array<object>>|null} массив рядов для JSON.stringify или null
 */
export const buildInlineKeyboardRowsFromDraft = (keyboardRows) => {
    if (!Array.isArray(keyboardRows) || keyboardRows.length === 0) return null;
    const out = [];
    for (const row of keyboardRows) {
        const rowOut = [];
        for (const btn of row.buttons || []) {
            const api = buttonDraftToApi(btn);
            if (api) rowOut.push(api);
        }
        if (rowOut.length) out.push(rowOut);
    }
    return out.length ? out : null;
};

/**
 * @returns {{ ok: true, rows: Array|null } | { ok: false, error: string }}
 */
export const validateKeyboardForSend = (keyboardRows, inlineLimits) => {
    const maxButtons = inlineLimits?.maxButtons ?? 100;
    const maxRows = inlineLimits?.maxRows ?? 100;
    const rowsDraft = keyboardRows || [];

    for (const row of rowsDraft) {
        for (const btn of row.buttons || []) {
            const t = (btn.text || '').trim();
            if (t.length === 0) continue;
            const api = buttonDraftToApi(btn);
            if (!api) {
                return {
                    ok: false,
                    error: `Кнопка «${t.slice(0, 32)}${t.length > 32 ? '…' : ''}»: проверьте тип действия и поля`,
                };
            }
        }
    }

    const rows = buildInlineKeyboardRowsFromDraft(rowsDraft);
    if (!rows) return {ok: true, rows: null};

    if (rows.length > maxRows) {
        return {ok: false, error: `Слишком много рядов (${rows.length} > ${maxRows})`};
    }
    let total = 0;
    for (const r of rows) total += r.length;
    if (total > maxButtons) {
        return {ok: false, error: `Слишком много кнопок (${total} > ${maxButtons})`};
    }

    return {ok: true, rows};
};
