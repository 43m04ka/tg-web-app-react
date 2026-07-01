/** Экранирование текста для Telegram HTML (parse_mode HTML). */
export const escapeTelegramHtmlText = (text) =>
    String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

const escapeAttr = (value) =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const serializeChildren = (node) => Array.from(node.childNodes).map(serializeNode).join('');

/**
 * DOM из contentEditable → подмножество HTML для Telegram (b, i, u, s, a, переносы).
 * Неизвестные теги разворачиваются в содержимое.
 */
const serializeNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
        return escapeTelegramHtmlText(node.textContent || '');
    }
    if (node.nodeType === Node.COMMENT_NODE) return '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();
    if (tag === 'br') return '\n';

    const inner = serializeChildren(node);

    switch (tag) {
        case 'b':
        case 'strong':
            return inner ? `<b>${inner}</b>` : '';
        case 'i':
        case 'em':
            return inner ? `<i>${inner}</i>` : '';
        case 'u':
            return inner ? `<u>${inner}</u>` : '';
        case 's':
        case 'strike':
        case 'del':
            return inner ? `<s>${inner}</s>` : '';
        case 'a': {
            const raw = node.getAttribute('href');
            const href = raw != null ? raw.trim() : '';
            if (href && /^https?:\/\//i.test(href)) {
                return `<a href="${escapeAttr(href)}">${inner}</a>`;
            }
            return inner;
        }
        case 'div':
        case 'p':
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'blockquote':
            return inner ? `${inner}\n` : '\n';
        case 'li':
            return inner ? `${inner}\n` : '';
        default:
            return inner;
    }
};

export const serializeEditorElementToTelegramHtml = (editorEl) => {
    if (!editorEl) return '';
    return serializeChildren(editorEl).replace(/\n{3,}/g, '\n\n').trim();
};
