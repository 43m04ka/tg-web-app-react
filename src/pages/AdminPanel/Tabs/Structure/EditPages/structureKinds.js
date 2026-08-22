// ТИПЫ БЛОКОВ ВИТРИНЫ
// -------------------
// В БД у блока (structureCatalog) есть поле type, и в нём смешаны две независимые вещи:
// что это за блок (слайдер / баннер / каталог) и куда он ведёт. Ссылка при этом
// закодирована префиксом внутри path: '/card/123', '/catalog/ps-games', '/choice-catalog/x'
// или произвольный внешний адрес.
//
// Раньше это разворачивалось в плоский список из пяти-девяти пунктов вида
// «На карту» / «На каталог» / «На каталог-выбор» / «Ссылочный», причём отдельно
// для карусели и отдельно для тела. Здесь те же комбинации описаны один раз:
// вид блока и цель ссылки выбираются по отдельности, а собирается из них
// ровно то же самое, что лежало в базе раньше.

/** Куда ведёт кликабельный блок. prefix — то, что дописывается в начало path */
export const LINK_TARGETS = [
    {key: 'card', label: 'Карточка товара', prefix: '/card/', valueLabel: 'ID карточки'},
    {key: 'catalog', label: 'Каталог', prefix: '/catalog/', valueLabel: 'Путь каталога'},
    {key: 'choice', label: 'Каталог с выбором', prefix: '/choice-catalog/', valueLabel: 'Путь каталога'},
    // Внешняя ссылка кладётся в path как есть, без префикса
    {key: 'external', label: 'Внешняя ссылка', prefix: '', valueLabel: 'Адрес'},
];

export const linkTarget = (key) => LINK_TARGETS.find((target) => target.key === key) || LINK_TARGETS[0];

/**
 * Виды блоков карусели.
 *
 * fields перечисляет, что показывать в форме: поля, которых нет у вида,
 * не должны и уезжать в БД — иначе у некликабельного слайдера оставался бы path
 * от предыдущего выбора.
 */
export const HEAD_KINDS = [
    {
        key: 'static',
        label: 'Картинка',
        hint: 'Просто изображение в карусели, без перехода',
        type: 'slider-non-clickable',
        fields: {image: true, link: false, name: false, catalogPath: false, color: false, icon: false, deleteDate: false},
    },
    {
        key: 'link',
        label: 'Картинка со ссылкой',
        hint: 'Изображение, по клику ведёт на товар, каталог или внешний адрес',
        type: 'slider-clickable',
        fields: {image: true, link: true, name: false, catalogPath: false, color: false, icon: false, deleteDate: false},
    },
];

/** Виды блоков основного содержимого */
export const BODY_KINDS = [
    {
        key: 'ordinary',
        label: 'Каталог',
        hint: 'Плитка каталога с названием и иконкой',
        type: 'ordinary',
        fields: {image: false, link: false, name: true, catalogPath: true, color: true, icon: true, deleteDate: false},
    },
    {
        key: 'ordinary-choice',
        label: 'Каталог с выбором',
        hint: 'Каталог, внутри которого покупатель выбирает вариант',
        type: 'ordinary-choice',
        fields: {image: false, link: false, name: true, catalogPath: true, color: true, icon: true, deleteDate: false},
    },
    {
        key: 'discount',
        label: 'Скидочный каталог',
        hint: 'Каталог акций',
        type: 'discount',
        fields: {image: false, link: false, name: true, catalogPath: true, color: true, icon: true, deleteDate: true},
    },
    {
        key: 'banner-static',
        label: 'Баннер',
        hint: 'Изображение во всю ширину, без перехода',
        type: 'banner-non-clickable',
        fields: {image: true, link: false, name: false, catalogPath: false, color: true, icon: false, deleteDate: false},
    },
    {
        key: 'banner-link',
        label: 'Баннер со ссылкой',
        hint: 'Изображение во всю ширину, по клику ведёт на товар, каталог или внешний адрес',
        type: 'banner-clickable',
        fields: {image: true, link: true, name: false, catalogPath: false, color: true, icon: false, deleteDate: false},
    },
];

export const kindsFor = (group) => (group === 'head' ? HEAD_KINDS : BODY_KINDS);

export const kindByKey = (group, key) => kindsFor(group).find((kind) => kind.key === key) || kindsFor(group)[0];

/** Вид блока по тому, что лежит в БД */
export const detectKind = (item, group) => {
    const type = String(item?.type || '');

    if (group === 'head') {
        return type === 'slider-non-clickable' ? HEAD_KINDS[0] : HEAD_KINDS[1];
    }

    if (type === 'banner-non-clickable') return kindByKey('body', 'banner-static');
    if (type === 'banner-clickable') return kindByKey('body', 'banner-link');

    return BODY_KINDS.find((kind) => kind.type === type) || BODY_KINDS[0];
};

/**
 * Разбирает path кликабельного блока на цель и значение.
 * Префиксы проверяем от длинного к короткому: '/choice-catalog/' начинается не с '/catalog/',
 * но полагаться на это в коде не стоит — порядок фиксируем явно.
 */
export const detectLink = (path) => {
    const value = String(path ?? '');

    const withPrefix = LINK_TARGETS
        .filter((target) => target.prefix)
        .sort((a, b) => b.prefix.length - a.prefix.length)
        .find((target) => value.startsWith(target.prefix));

    if (withPrefix) {
        return {target: withPrefix.key, value: value.slice(withPrefix.prefix.length)};
    }

    return {target: 'external', value};
};

/** Короткая подпись блока для списка */
export const describeBlock = (item, group) => {
    const kind = detectKind(item, group);

    if (!kind.fields.link) return kind.label;

    const {target} = detectLink(item?.path);
    return `${kind.label} · ${linkTarget(target).label}`;
};

/** Человекочитаемое назначение блока: то, что видно в колонке «Ведёт на» */
export const describeTarget = (item, group) => {
    const kind = detectKind(item, group);

    if (kind.fields.link) {
        const {target, value} = detectLink(item?.path);
        return value ? `${linkTarget(target).label}: ${value}` : linkTarget(target).label;
    }

    if (kind.fields.catalogPath) return item?.path || '—';

    return '—';
};

/**
 * Значения формы -> запись для БД.
 *
 * Поля, которых у вида нет, отправляем пустыми явно: если блок переделали из
 * кликабельного в обычный, старый path обязан очиститься, иначе витрина продолжит
 * вести на прежний адрес.
 */
export const toBlockPayload = (values, {group, structurePageId}) => {
    const kind = kindByKey(group, values.kind);
    const fields = kind.fields;

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
            : null,
    };

    if (fields.link) {
        payload.path = `${linkTarget(values.linkTarget).prefix}${values.linkValue || ''}`;
    } else if (fields.catalogPath) {
        payload.path = values.path || '';
    } else {
        payload.path = null;
    }

    if (structurePageId !== undefined) {
        payload.structurePageId = structurePageId;
    }

    return payload;
};

/** Запись из БД -> значения формы */
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
        isRoundedBorderBottom: Boolean(item?.isRoundedBorderBottom),
    };
};
