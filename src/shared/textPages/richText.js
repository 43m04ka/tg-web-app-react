const INLINE = /\*\*(.+?)\*\*|\[([^\]\n]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<>]+[^\s<>.,;:!?)»"'])/g;
const BULLET = /^[-•·]\s+(.*)$/;
const ORDERED = /^(\d{1,3})[.)]\s+(.*)$/;
const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/)/i;

export const safeLink = (href) => {
    const value = String(href || '').trim();
    return SAFE_LINK.test(value) ? value : '';
};

export const isInternalLink = (href) => href.startsWith('/') && !href.startsWith('//');

export const parseInline = (source) => {
    const text = String(source ?? '');
    const tokens = [];
    let cursor = 0;

    text.replace(INLINE, (match, bold, label, href, bare, index) => {
        if (index > cursor) tokens.push({type: 'text', value: text.slice(cursor, index)});

        if (bold !== undefined) {
            tokens.push({type: 'bold', children: parseInline(bold)});
        } else {
            const target = safeLink(href || bare);

            if (target) tokens.push({type: 'link', href: target, value: label || bare});
            else tokens.push({type: 'text', value: label || match});
        }

        cursor = index + match.length;
        return match;
    });

    if (cursor < text.length) tokens.push({type: 'text', value: text.slice(cursor)});

    return tokens;
};

const listItem = (line) => {
    const bullet = BULLET.exec(line);
    if (bullet) return {kind: 'ul', text: bullet[1]};

    const ordered = ORDERED.exec(line);
    if (ordered) return {kind: 'ol', text: ordered[2], number: Number(ordered[1])};

    return null;
};

export const parseText = (source) => {
    const parts = [];

    String(source ?? '').replace(/\r\n?/g, '\n').split(/\n{2,}/).forEach((chunk) => {
        let lines = [];

        const flush = () => {
            if (lines.length) parts.push({kind: 'p', lines});
            lines = [];
        };

        chunk.split('\n').map((line) => line.trim()).filter(Boolean).forEach((line) => {
            const item = listItem(line);

            if (!item) {
                lines.push(line);
                return;
            }

            flush();

            const last = parts[parts.length - 1];
            const entry = {text: item.text, number: item.number};

            if (last && last.kind === item.kind && last.open) last.items.push(entry);
            else parts.push({kind: item.kind, items: [entry], open: true});
        });

        flush();

        const last = parts[parts.length - 1];
        if (last) last.open = false;
    });

    return parts;
};

export const plainText = (source) => String(source ?? '')
    .replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const embedUrl = (url) => {
    const value = safeLink(url);
    if (!value) return '';

    const youtube = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/.exec(value);
    if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

    const rutube = /rutube\.ru\/(?:video|play\/embed)\/([\w-]+)/.exec(value);
    if (rutube) return `https://rutube.ru/play/embed/${rutube[1]}`;

    const vk = /vk\.(?:com|ru)\/video(-?\d+)_(\d+)/.exec(value);
    if (vk) return `https://vk.com/video_ext.php?oid=${vk[1]}&id=${vk[2]}`;

    return /\/embed\/|video_ext\.php/.test(value) ? value : '';
};
