export const START_PLATFORMS = [
    {value: 'tg', title: 'Telegram'},
    {value: 'vk-ps', title: 'VK PS'},
    {value: 'vk-xbox', title: 'VK Xbox'},
    {value: 'web', title: 'Веб'},
    {value: 'test', title: 'Тест'}
];

export const START_TYPES = [
    {value: 'title', title: 'Заголовок группы'},
    {value: 'page', title: 'Плитка витрины'},
    {value: 'link', title: 'Внешняя ссылка'},
    {value: 'label', title: 'Пояснение'}
];

export const TYPE_HINTS = {
    title: 'Начинает новую группу. Всё, что идёт следом, попадает под этот заголовок.',
    page: 'Плитка, ведущая на витрину. Если витрин в группе больше одной, они встают сеткой.',
    link: 'Открывает внешний адрес, а не витрину.',
    label: 'Строка пояснения под заголовком. Ничего не открывает.'
};

export const typeTitle = (value) => START_TYPES.find((item) => item.value === value)?.title || value;

export const platformTitle = (value) =>
    START_PLATFORMS.find((item) => item.value === value)?.title || value;

export const emptyStartItem = (platform = 'tg') => ({
    platform,
    type: 'page',
    icon: '',
    url: '',
    color: '',
    text: '',
    title: '',
    structurePageId: '',
    serialNumber: 0
});

export const toDraft = (item) => (item ? {
    platform: item.platform || 'tg',
    type: item.type || 'page',
    icon: item.icon ?? '',
    url: item.url ?? '',
    color: item.color ?? '',
    text: item.text ?? '',
    title: item.title ?? '',
    structurePageId: item.structurePageId === null || item.structurePageId === undefined
        ? ''
        : String(item.structurePageId),
    serialNumber: item.serialNumber ?? 0
} : emptyStartItem());

export const toPayload = (draft) => ({
    platform: draft.platform,
    type: draft.type,
    icon: draft.icon.trim(),
    url: draft.type === 'link' ? draft.url.trim() : '',
    color: draft.color.trim(),
    text: draft.text.trim(),
    title: draft.title.trim(),
    structurePageId: draft.type === 'page' && draft.structurePageId !== ''
        ? Number(draft.structurePageId)
        : null,
    serialNumber: Number(draft.serialNumber) || 0
});

export const startProblem = (draft) => {
    if (draft.type === 'page') {
        if (draft.structurePageId === '') return 'Выберите витрину, на которую ведёт плитка';
        return null;
    }

    if (draft.type === 'link') {
        if (!draft.title.trim()) return 'Без подписи ссылку не на что нажимать';
        if (!draft.url.trim()) return 'Укажите адрес';
        if (!/^https?:\/\/|^tg:\/\//i.test(draft.url.trim())) {
            return 'Адрес должен начинаться с http://, https:// или tg://';
        }
        return null;
    }

    if (draft.type === 'title' && !draft.title.trim()) return 'Заголовок группы не может быть пустым';
    if (draft.type === 'label' && !draft.text.trim()) return 'Пояснение не может быть пустым';

    return null;
};

export const startTitle = (item, pages) => {
    if (item.type === 'page') {
        const page = (pages || []).find((candidate) => candidate.id === item.structurePageId);
        return item.title || page?.name || `Витрина №${item.structurePageId ?? '—'}`;
    }

    return item.title || item.text || typeTitle(item.type);
};

export const sortStart = (list) => (list || []).slice().sort((left, right) => {
    const order = (left.serialNumber ?? 0) - (right.serialNumber ?? 0);
    return order !== 0 ? order : (left.id ?? 0) - (right.id ?? 0);
});

export const byPlatform = (list, platform) =>
    sortStart(list).filter((item) => item.platform === platform);

export const moveStart = (list, id, delta) => {
    const ordered = sortStart(list);
    const from = ordered.findIndex((item) => item.id === id);
    const to = from + delta;

    if (from < 0 || to < 0 || to >= ordered.length) return null;

    const moved = ordered.slice();
    [moved[from], moved[to]] = [moved[to], moved[from]];

    return moved.map((item, index) => ({...item, serialNumber: index}));
};

export const toGroups = (items) => {
    const groups = [];
    let current = null;

    items.forEach((item) => {
        if (item.type === 'title' || !current) {
            current = {header: item.type === 'title' ? item : null, key: item.id, children: []};
            groups.push(current);
            if (item.type === 'title') return;
        }

        current.children.push(item);
    });

    return groups;
};

export const orphanWarning = (items) => {
    const ordered = sortStart(items);
    if (ordered.length === 0) return null;

    const firstTitle = ordered.findIndex((item) => item.type === 'title');
    if (firstTitle <= 0) return null;

    return `Первые ${firstTitle} записей идут до первого заголовка — витрина соберёт из них группу без названия.`;
};
