export const LINK_TARGETS = [
    {key: 'card', label: 'Карточка товара', prefix: '/card/', valueLabel: 'ID карточки'},
    {key: 'catalog', label: 'Каталог', prefix: '/catalog/', valueLabel: 'Путь каталога'},
    {key: 'choice', label: 'Каталог с выбором', prefix: '/choice-catalog/', valueLabel: 'Путь каталога'},
    {key: 'external', label: 'Внешняя ссылка', prefix: '', valueLabel: 'Адрес'}
];

export const linkTarget = (key) => LINK_TARGETS.find((target) => target.key === key) || LINK_TARGETS[0];

export const HEAD_KINDS = [
    {
        key: 'static',
        label: 'Картинка',
        hint: 'Просто изображение в карусели, без перехода',
        type: 'slider-non-clickable',
        fields: {image: true, link: false, name: false, catalogPath: false, color: false, icon: false, deleteDate: false}
    },
    {
        key: 'link',
        label: 'Картинка со ссылкой',
        hint: 'Изображение, по клику ведёт на товар, каталог или внешний адрес',
        type: 'slider-clickable',
        fields: {image: true, link: true, name: false, catalogPath: false, color: false, icon: false, deleteDate: false}
    }
];

export const BODY_KINDS = [
    {
        key: 'ordinary',
        label: 'Каталог',
        hint: 'Полка каталога с названием и иконкой',
        type: 'ordinary',
        fields: {image: false, link: false, name: true, catalogPath: true, color: true, icon: true, deleteDate: false}
    },
    {
        key: 'ordinary-choice',
        label: 'Каталог с выбором',
        hint: 'Каталог, внутри которого покупатель выбирает вариант',
        type: 'ordinary-choice',
        fields: {image: false, link: false, name: true, catalogPath: true, color: true, icon: true, deleteDate: false}
    },
    {
        key: 'discount',
        label: 'Скидочный каталог',
        hint: 'Каталог акций, со сроком снятия',
        type: 'discount',
        fields: {image: false, link: false, name: true, catalogPath: true, color: true, icon: true, deleteDate: true}
    },
    {
        key: 'banner-static',
        label: 'Баннер',
        hint: 'Изображение во всю ширину, без перехода',
        type: 'banner-non-clickable',
        fields: {image: true, link: false, name: false, catalogPath: false, color: true, icon: false, deleteDate: false}
    },
    {
        key: 'banner-link',
        label: 'Баннер со ссылкой',
        hint: 'Изображение во всю ширину, по клику ведёт на товар, каталог или внешний адрес',
        type: 'banner-clickable',
        fields: {image: true, link: true, name: false, catalogPath: false, color: true, icon: false, deleteDate: false}
    }
];

export const GROUPS = [
    {value: 'head', title: 'Карусель'},
    {value: 'body', title: 'Содержимое'}
];

export const kindsFor = (group) => (group === 'head' ? HEAD_KINDS : BODY_KINDS);

export const kindByKey = (group, key) => kindsFor(group).find((kind) => kind.key === key) || kindsFor(group)[0];

export const detectKind = (item, group) => {
    const type = String(item?.type || '');

    if (group === 'head') return type === 'slider-non-clickable' ? HEAD_KINDS[0] : HEAD_KINDS[1];

    if (type === 'banner-non-clickable') return kindByKey('body', 'banner-static');
    if (type === 'banner-clickable') return kindByKey('body', 'banner-link');

    return BODY_KINDS.find((kind) => kind.type === type) || BODY_KINDS[0];
};

export const detectLink = (path) => {
    const value = String(path ?? '');

    const withPrefix = LINK_TARGETS
        .filter((target) => target.prefix)
        .slice()
        .sort((left, right) => right.prefix.length - left.prefix.length)
        .find((target) => value.startsWith(target.prefix));

    return withPrefix
        ? {target: withPrefix.key, value: value.slice(withPrefix.prefix.length)}
        : {target: 'external', value};
};

export const describeBlock = (item, group) => {
    const kind = detectKind(item, group);
    if (!kind.fields.link) return kind.label;

    return `${kind.label} · ${linkTarget(detectLink(item?.path).target).label}`;
};

export const describeTarget = (item, group) => {
    const kind = detectKind(item, group);

    if (kind.fields.link) {
        const {target, value} = detectLink(item?.path);
        return value ? `${linkTarget(target).label}: ${value}` : linkTarget(target).label;
    }

    if (kind.fields.catalogPath) return item?.path || '—';

    return '—';
};

export const toBlockPayload = (values, {group, structurePageId}) => {
    const kind = kindByKey(group, values.kind);
    const {fields} = kind;

    const payload = {
        group,
        type: kind.type,
        serialNumber: Number(values.serialNumber) || 0,
        isRoundedBorderTop: values.isRoundedBorderTop ? 1 : 0,
        isRoundedBorderBottom: values.isRoundedBorderBottom ? 1 : 0,
        name: fields.name ? (values.name || '') : null,
        url: fields.image ? (values.url || '') : null,
        backgroundColor: fields.color ? (values.backgroundColor || '') : null,
        imageIcon: fields.icon ? (values.imageIcon || '') : null,
        deleteDate: fields.deleteDate && values.deleteDate !== '' && values.deleteDate !== null
            ? Number(values.deleteDate) || null
            : null
    };

    if (fields.link) payload.path = `${linkTarget(values.linkTarget).prefix}${values.linkValue || ''}`;
    else if (fields.catalogPath) payload.path = values.path || '';
    else payload.path = null;

    if (structurePageId !== undefined) payload.structurePageId = structurePageId;

    return payload;
};

export const toFormValues = (item, group) => {
    const kind = detectKind(item || {}, group);
    const link = detectLink(item?.path);

    return {
        kind: kind.key,
        serialNumber: item?.serialNumber ?? 0,
        name: item?.name ?? '',
        url: item?.url ?? '',
        path: kind.fields.catalogPath ? (item?.path ?? '') : '',
        linkTarget: link.target,
        linkValue: kind.fields.link ? link.value : '',
        backgroundColor: item?.backgroundColor ?? '',
        imageIcon: item?.imageIcon ?? '',
        deleteDate: item?.deleteDate ?? '',
        isRoundedBorderTop: Boolean(item?.isRoundedBorderTop),
        isRoundedBorderBottom: Boolean(item?.isRoundedBorderBottom)
    };
};

export const blockProblem = (values, group) => {
    const kind = kindByKey(group, values.kind);
    const {fields} = kind;

    if (fields.name && !String(values.name || '').trim()) return 'Без названия полка выйдет безымянной';
    if (fields.image && !String(values.url || '').trim()) return 'Нужна картинка';
    if (fields.catalogPath && !String(values.path || '').trim()) return 'Укажите путь каталога';

    if (fields.link) {
        const value = String(values.linkValue || '').trim();
        if (!value) return `Укажите ${linkTarget(values.linkTarget).valueLabel.toLowerCase()}`;

        if (values.linkTarget === 'card' && !/^\d+$/.test(value)) return 'ID карточки — только цифры';
        if (values.linkTarget === 'external' && !/^https?:\/\//i.test(value)) {
            return 'Внешний адрес должен начинаться с http:// или https://';
        }
    }

    return null;
};

export const sortBlocks = (list) => (list || []).slice()
    .sort((left, right) => (left.serialNumber ?? 0) - (right.serialNumber ?? 0));

export const renumber = (list) => sortBlocks(list).map((item, index) => ({...item, serialNumber: index}));

export const moveBlock = (list, id, delta) => {
    const ordered = sortBlocks(list);
    const from = ordered.findIndex((item) => item.id === id);
    const to = from + delta;

    if (from < 0 || to < 0 || to >= ordered.length) return null;

    const moved = ordered.slice();
    [moved[from], moved[to]] = [moved[to], moved[from]];

    return moved.map((item, index) => ({...item, serialNumber: index}));
};
