export const SECTIONS = [
    {id: 'page', title: 'Страницы', one: 'Страница', route: '/info'},
    {id: 'guide', title: 'Инструкции', one: 'Инструкция', route: '/faq'},
    {id: 'news', title: 'Новости', one: 'Новость', route: '/news'}
];

export const SECTION_OPTIONS = SECTIONS.map((section) => ({value: section.id, title: section.one}));

export const TAG_OPTIONS = [
    {value: '', title: 'Без метки'},
    {value: 'ps', title: 'PlayStation'},
    {value: 'xbox', title: 'Xbox'},
    {value: 'general', title: 'Общее'}
];

export const BLOCK_KINDS = [
    {type: 'heading', title: 'Заголовок', blank: {level: 2, text: ''}},
    {type: 'text', title: 'Текст', blank: {text: ''}},
    {type: 'image', title: 'Картинка', blank: {src: '', caption: ''}},
    {type: 'gallery', title: 'Галерея', blank: {images: []}},
    {type: 'video', title: 'Видео', blank: {url: ''}},
    {type: 'buttons', title: 'Кнопки', blank: {items: [{label: '', href: ''}]}},
    {type: 'faq', title: 'Вопросы и ответы', blank: {items: [{question: '', answer: ''}]}},
    {type: 'note', title: 'Важное', blank: {text: ''}}
];

export const LEVEL_OPTIONS = [
    {value: '2', title: 'Крупный'},
    {value: '3', title: 'Средний'}
];

let uidCounter = 0;

const nextUid = () => {
    uidCounter += 1;
    return `b${uidCounter}`;
};

const clone = (value) => JSON.parse(JSON.stringify(value));

export const sectionOf = (id) => SECTIONS.find((section) => section.id === id) || SECTIONS[0];

export const kindTitle = (type) => BLOCK_KINDS.find((kind) => kind.type === type)?.title || type;

export const newBlock = (type) => {
    const kind = BLOCK_KINDS.find((item) => item.type === type);
    return {type, ...clone(kind.blank), uid: nextUid()};
};

export const publicRoute = (page) => `${sectionOf(page.section).route}/${page.slug}`;

const pad = (value) => String(value).padStart(2, '0');

export const toLocalInput = (value) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const fromLocalInput = (value) => {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const toDraft = (page, section = 'page') => ({
    title: page?.title || '',
    slug: page?.slug || '',
    section: page?.section || section,
    tag: page?.tag || '',
    excerpt: page?.excerpt || '',
    cover: page?.cover || '',
    isPublished: page ? page.isPublished !== false : true,
    showInFooter: Boolean(page?.showInFooter),
    showInMenu: Boolean(page?.showInMenu),
    serialNumber: String(page?.serialNumber ?? 0),
    publishedAt: toLocalInput(page?.publishedAt),
    blocks: (page?.blocks || []).map((block) => ({...clone(block), uid: nextUid()}))
});

export const toPayload = (draft) => ({
    title: draft.title.trim(),
    slug: draft.slug.trim(),
    section: draft.section,
    tag: draft.section === 'page' ? '' : draft.tag,
    excerpt: draft.excerpt.trim(),
    cover: draft.cover.trim(),
    isPublished: draft.isPublished,
    showInFooter: draft.showInFooter,
    showInMenu: draft.showInMenu,
    serialNumber: Number(draft.serialNumber) || 0,
    publishedAt: fromLocalInput(draft.publishedAt),
    blocks: draft.blocks.map(({uid, ...block}) => block)
});

export const isDirty = (draft, base) => JSON.stringify(toPayload(draft)) !== JSON.stringify(toPayload(base));

export const validate = (draft) => {
    const errors = {};

    if (!draft.title.trim()) errors.title = 'Нужен заголовок';
    if (draft.slug.trim() && !/^[a-z0-9][a-z0-9-]*$/.test(draft.slug.trim())) {
        errors.slug = 'Только латиница, цифры и дефис';
    }

    return errors;
};

export const moveItem = (list, index, shift) => {
    const target = index + shift;
    if (target < 0 || target >= list.length) return list;

    const next = list.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);

    return next;
};

export const insertAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index)];

export const blockSummary = (block) => {
    if (block.type === 'heading' || block.type === 'text' || block.type === 'note') {
        return String(block.text || '').replace(/\s+/g, ' ').trim();
    }
    if (block.type === 'image') return block.caption || block.src || '';
    if (block.type === 'gallery') return `Картинок: ${(block.images || []).length}`;
    if (block.type === 'video') return block.url || '';
    if (block.type === 'buttons') return (block.items || []).map((item) => item.label).filter(Boolean).join(', ');
    if (block.type === 'faq') return `Вопросов: ${(block.items || []).length}`;

    return '';
};

export const wrapSelection = (value, start, end, before, after, placeholder) => {
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);

    return {
        value: next,
        start: start + before.length,
        end: start + before.length + selected.length
    };
};

export const prefixLines = (value, start, end, prefix) => {
    const from = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const tail = value.indexOf('\n', end);
    const to = tail === -1 ? value.length : tail;

    const lines = value.slice(from, to).split('\n').map((line, index) => {
        const mark = typeof prefix === 'function' ? prefix(index) : prefix;
        return line.trim() ? mark + line : line;
    });

    const chunk = lines.join('\n');

    return {value: value.slice(0, from) + chunk + value.slice(to), start: from, end: from + chunk.length};
};
