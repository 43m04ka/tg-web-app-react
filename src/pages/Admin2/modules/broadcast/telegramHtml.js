export const escapeText = (text) =>
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

const serializeNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return escapeText(node.textContent || '');
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
        case 'code':
            return inner ? `<code>${inner}</code>` : '';
        case 'pre':
            return inner ? `<pre>${inner}</pre>` : '';
        case 'a': {
            const raw = node.getAttribute('href');
            const href = raw ? raw.trim() : '';
            return href && /^https?:\/\//i.test(href)
                ? `<a href="${escapeAttr(href)}">${inner}</a>`
                : inner;
        }
        case 'img': {
            const emojiId = node.getAttribute('data-tg-emoji-id');
            if (!emojiId) return '';

            const fallback = node.getAttribute('alt') || '💙';
            return `<tg-emoji emoji-id="${escapeAttr(emojiId)}">${escapeText(fallback)}</tg-emoji>`;
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

export const serializeEditor = (element) =>
    (element ? serializeChildren(element).replace(/\n{3,}/g, '\n\n').trim() : '');

const PREVIEW_TAGS = {
    b: ['<strong>', '</strong>'],
    i: ['<em>', '</em>'],
    u: ['<u>', '</u>'],
    s: ['<s>', '</s>'],
    code: ['<code>', '</code>'],
    pre: ['<pre>', '</pre>']
};

export const toPreviewHtml = (telegramHtml) => {
    let out = String(telegramHtml || '');

    Object.entries(PREVIEW_TAGS).forEach(([tag, [open, close]]) => {
        out = out.split(`<${tag}>`).join(open).split(`</${tag}>`).join(close);
    });

    out = out.replace(/<tg-emoji emoji-id="[^"]*">([\s\S]*?)<\/tg-emoji>/g, '$1');
    out = out.replace(/<a href="([^"]*)">([\s\S]*?)<\/a>/g, '<span data-link="$1">$2</span>');

    return out.split('\n').join('<br/>');
};
