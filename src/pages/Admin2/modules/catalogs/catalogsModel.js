export const PATH_PATTERN = /^[a-z0-9_-]{2,64}$/;

export const SALE_STATES = {
    0: {title: 'Снят с продажи', tone: 'danger'},
    1: {title: 'Частично', tone: 'warning'},
    2: {title: 'В продаже', tone: 'positive'}
};

export const SOURCES = [
    {value: 'ps', title: 'PlayStation'},
    {value: 'ps_india', title: 'PlayStation Индия'},
    {value: 'xbox', title: 'Xbox'}
];

export const QUEUE_OF = (source) => (source === 'xbox' ? 'xbox' : 'ps');

export const PS_CATEGORY_HINT = 'Ссылка вида /category/<id>. Страница /pages/deals не годится — с неё товары не разбираются.';

export const saleState = (catalog) => SALE_STATES[catalog?.onSale] || {title: 'Неизвестно', tone: 'neutral'};

export const pageTitleOf = (catalog, pages) =>
    (pages || []).find((page) => page.id === catalog?.structurePageId)?.name || null;

export const sourceOfPage = (catalog, pages) => {
    const type = (pages || []).find((page) => page.id === catalog?.structurePageId)?.type;

    if (type === 'xbox') return 'xbox';
    if (type === 'ps_india') return 'ps_india';
    if (type === 'ps') return 'ps';

    return null;
};

export const sortCatalogs = (list, pages) => (list || []).slice().sort((left, right) => {
    const leftPage = pageTitleOf(left, pages) || '';
    const rightPage = pageTitleOf(right, pages) || '';

    const byPage = leftPage.localeCompare(rightPage, 'ru');
    if (byPage !== 0) return byPage;

    return String(left.path || '').localeCompare(String(right.path || ''), 'ru');
});

export const catalogProblem = (draft, {existing = [], id = null} = {}) => {
    const path = String(draft.path || '').trim();

    if (!path) return 'Без пути каталог не привязать к блоку витрины';
    if (!PATH_PATTERN.test(path)) return 'Латиница в нижнем регистре, цифры, дефис и подчёркивание, от 2 до 64 знаков';
    if (existing.some((item) => item.id !== id && String(item.path) === path)) return 'Такой путь уже занят';
    if (!draft.structurePageId) return 'Выберите витрину, к которой относится каталог';

    return null;
};

const positive = (value) => {
    const number = Number(String(value).trim());
    return Number.isInteger(number) && number >= 0 ? number : null;
};

export const parseProblem = (form) => {
    if (form.mode === 'links') {
        const links = String(form.links || '').split('\n').map((line) => line.trim()).filter(Boolean);

        if (links.length === 0) return 'Вставьте хотя бы одну ссылку';
        if (links.some((link) => !/^https?:\/\//i.test(link))) return 'Каждая ссылка должна начинаться с http:// или https://';

        return null;
    }

    if (form.source === 'xbox') {
        if (form.limitMode === 'pages' && positive(form.countPages) === null) return 'Число страниц — целое, от нуля';
        if (form.limitMode === 'items' && !positive(form.countItems)) return 'Укажите, сколько позиций сохранить';

        return null;
    }

    const category = String(form.categoryUrl || '').trim();
    if (!category) return 'Укажите ссылку или id категории';
    if (/\/pages\/deals/i.test(category)) return PS_CATEGORY_HINT;
    if (form.pagesMode === 'limit' && positive(form.countPages) === null) return 'Число страниц — целое, от нуля';

    return null;
};

export const toParsePayload = (form, catalog) => {
    if (form.mode === 'links') {
        return {
            links: String(form.links || '').split('\n').map((line) => line.trim()).filter(Boolean),
            bdPath: catalog.path,
            platform: form.source,
            parceAddons: Boolean(form.parceAddons),
            safeMode: Boolean(form.safeMode)
        };
    }

    if (form.source === 'xbox') {
        return {
            catalogId: String(form.categoryUrl || '').trim(),
            bdPath: catalog.path,
            countPages: form.limitMode === 'pages' ? positive(form.countPages) ?? 0 : 0,
            countItems: form.limitMode === 'items' ? positive(form.countItems) ?? 0 : 0,
            parceAddons: Boolean(form.parceAddons),
            safeMode: Boolean(form.safeMode)
        };
    }

    return {
        catalogId: String(form.categoryUrl || '').trim(),
        bdPath: catalog.path,
        countPages: form.pagesMode === 'limit' ? positive(form.countPages) ?? 0 : 0,
        platform: form.source,
        parceAddons: Boolean(form.parceAddons),
        safeMode: Boolean(form.safeMode)
    };
};

export const emptyParseForm = (source) => ({
    mode: 'catalog',
    source: source || 'ps',
    categoryUrl: '',
    pagesMode: 'auto',
    countPages: '',
    limitMode: 'pages',
    countItems: '',
    links: '',
    parceAddons: false,
    safeMode: false
});

export const queueState = (queue, source) => {
    const state = queue?.[QUEUE_OF(source)] || null;

    return {
        running: state?.running || null,
        waiting: Array.isArray(state?.waiting) ? state.waiting : []
    };
};

export const queueBusy = (queue, source) => {
    const {running, waiting} = queueState(queue, source);

    if (!running && waiting.length === 0) return null;

    return waiting.length > 0
        ? `Источник занят: идёт задача и ещё ${waiting.length} в очереди`
        : 'Источник занят: идёт другая задача';
};

export const recheckSummary = (report) => {
    if (!report) return null;

    const checked = Number(report.checked) || 0;
    const mismatched = Number(report.mismatched ?? report.underpriced?.length) || 0;

    return {
        checked,
        mismatched,
        share: checked > 0 ? Math.round((mismatched / checked) * 100) : 0
    };
};
