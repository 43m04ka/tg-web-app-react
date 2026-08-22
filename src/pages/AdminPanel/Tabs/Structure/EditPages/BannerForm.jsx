import React, {useEffect, useMemo, useRef, useState} from 'react';
import f, {Group, Row, Sheet} from '../../../Elements/FormLayout/FormLayout';
import s from './StructurePanel.module.scss';
import BannerPreview from './BannerPreview';
import {
    DEFAULT_GRADIENT,
    IMAGE_FIT_LABELS,
    TYPE_LABELS,
    formatPrice,
    formatPromoDate,
} from './bannerContent';

const SEARCH_DELAY_MS = 300;

const readOverride = (data) => ({
    title: data?.override?.title || '',
    image: data?.override?.image || '',
    imageFit: data?.override?.imageFit || '',
});

// Из сохранённого баннера восстанавливаем карточку товара: поиск при открытии формы
// пуст, а превью должно работать сразу, без повторного запроса.
const sourceFromBanner = (item) => {
    const data = item?.data || {};
    if (item?.type !== 'product' || !data.productId) return null;

    return {
        id: data.productId,
        name: data.title || '',
        image: data.image || '',
        imageFit: data.imageFit || 'banner',
        price: data.price ?? null,
        oldPrice: data.oldPrice ?? null,
        promoEndDate: data.promoEndDate || '',
        hasBanner: data.imageFit === 'banner',
    };
};

const BannerForm = ({item, pageId, searchSources, onSubmit, onCancel, showToast}) => {
    const isNew = !item?.id;
    const type = item?.type || 'product';

    const [values, setValues] = useState(() => {
        const data = item?.data || {};

        return {
            everywhere: item?.pageId === null || item?.pageId === undefined ? !isNew : false,
            isHidden: item?.isHidden === 1,
            subtitle: data.subtitle || '',
            note: data.note || '',
            url: data.url || '',
            title: data.title || '',
            image: data.image || '',
            imageFit: data.imageFit || 'banner',
            gradient: data.gradient || DEFAULT_GRADIENT,
            override: readOverride(data),
        };
    });

    const [source, setSource] = useState(() => sourceFromBanner(item));
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);

    const searchRef = useRef(searchSources);
    searchRef.current = searchSources;

    const setValue = (key, value) => setValues((prev) => ({...prev, [key]: value}));
    const setOverride = (key, value) =>
        setValues((prev) => ({...prev, override: {...prev.override, [key]: value}}));

    useEffect(() => {
        if (type !== 'product') return undefined;

        const text = query.trim();
        if (text.length < 2) {
            setResults([]);
            return undefined;
        }

        const controller = new AbortController();
        const timerId = setTimeout(async () => {
            setSearching(true);
            try {
                setResults(await searchRef.current(text, controller.signal));
            } catch (error) {
                if (error.name !== 'AbortError') showToast(error.message || 'Поиск не удался', 'error');
            } finally {
                setSearching(false);
            }
        }, SEARCH_DELAY_MS);

        return () => {
            controller.abort();
            clearTimeout(timerId);
        };
    }, [query, type, showToast]);

    // То же, что соберёт сервер: ручные правки перекрывают данные товара
    const previewBanner = useMemo(() => {
        if (type !== 'product') {
            return {
                type,
                data: {
                    title: values.title,
                    subtitle: values.subtitle,
                    note: values.note,
                    image: values.image,
                    imageFit: values.imageFit,
                    gradient: values.gradient,
                },
            };
        }

        if (!source) return {type, data: {title: 'Товар не выбран', subtitle: values.subtitle}};

        return {
            type,
            data: {
                title: values.override.title || source.name,
                subtitle: values.subtitle,
                note: values.note,
                image: values.override.image || source.image,
                imageFit: values.override.imageFit || (values.override.image ? 'banner' : source.imageFit),
                price: source.price,
                oldPrice: source.oldPrice,
                promoEndDate: source.promoEndDate,
            },
        };
    }, [type, source, values]);

    const handleSubmit = async () => {
        if (type === 'product' && !source) {
            showToast('Выберите товар для баннера', 'error');
            return;
        }

        const url = values.url.trim();
        if (url && !/^https?:\/\//i.test(url)) {
            showToast('URL должен начинаться с http:// или https://', 'error');
            return;
        }

        const data = type === 'product'
            ? {productId: source.id, subtitle: values.subtitle, note: values.note, url, override: values.override}
            : {
                title: values.title,
                subtitle: values.subtitle,
                note: values.note,
                url,
                image: values.image,
                imageFit: values.imageFit,
                gradient: values.gradient,
            };

        setSaving(true);
        try {
            await onSubmit({
                type,
                pageId: values.everywhere ? null : pageId,
                isHidden: values.isHidden ? 1 : 0,
                serialNumber: item?.serialNumber ?? 0,
                data,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={s['form']}>
            <div className={s['formHead']}>
                <span className={s['formTitle']}>
                    {isNew ? 'Новый баннер' : 'Баннер'} · {TYPE_LABELS[type].toLowerCase()}
                </span>
            </div>

            <div className={s['formBody']}>
                <Sheet>
                    {type === 'product' ? (
                        <Group title="Товар">
                            <Row label="Поиск" hint="Название игры, подписки или доната — от двух букв" top wide>
                                <div className={s['bannerSearch']}>
                                    <input className={f.input} type="text" placeholder="Grand Theft Auto"
                                           value={query}
                                           onChange={(event) => setQuery(event.target.value)}/>

                                    {searching ? <span className={s['bannerHint']}>Ищем…</span> : null}

                                    {results.length ? (
                                        <ul className={s['bannerResults']}>
                                            {results.map((product) => (
                                                <li key={product.id}>
                                                    <button type="button" className={s['bannerResult']}
                                                            onClick={() => {
                                                                setSource(product);
                                                                setResults([]);
                                                                setQuery('');
                                                            }}>
                                                        <span className={s['bannerResultImage']}
                                                              style={{
                                                                  backgroundImage: product.image ? `url(${product.image})` : 'none',
                                                                  backgroundPosition: product.imageFit === 'coverTop' ? 'top center' : 'center',
                                                              }}/>
                                                        <span className={s['bannerResultBody']}>
                                                            <span className={s['bannerResultName']}>{product.name}</span>
                                                            <span className={s['bannerHint']}>
                                                                {product.typeLabel ? `${product.typeLabel} · ` : ''}
                                                                {formatPrice(product.price) || 'без цены'}
                                                                {product.hasBanner ? ' · есть 4:3' : ' · обложка'}
                                                            </span>
                                                        </span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            </Row>

                            <Row label="Выбран" top wide>
                                {source ? (
                                    <div className={s['bannerPicked']}>
                                        <span className={s['bannerResultName']}>{source.name}</span>
                                        <span className={s['bannerHint']}>
                                            ID {source.id} · {formatPrice(source.price) || 'без цены'}
                                            {source.oldPrice ? ` · было ${formatPrice(source.oldPrice)}` : ''}
                                            {source.promoEndDate ? ` · акция до ${formatPromoDate(source.promoEndDate)}` : ''}
                                        </span>
                                        <span className={s['bannerHint']}>
                                            {source.hasBanner
                                                ? 'Картинка: баннер 4:3 из карточки'
                                                : 'Баннера 4:3 нет — берём обложку и кадрируем по верхнему краю'}
                                        </span>
                                    </div>
                                ) : (
                                    <span className={s['bannerHint']}>Товар не выбран</span>
                                )}
                            </Row>
                        </Group>
                    ) : (
                        <Group title="Содержимое">
                            <Row label="Заголовок" wide>
                                <input className={f.input} type="text" value={values.title}
                                       onChange={(event) => setValue('title', event.target.value)}/>
                            </Row>
                            <Row label="Картинка" hint="Ссылка. Пусто — рисуем градиент" wide>
                                <input className={`${f.input} ${f.mono}`} type="text" value={values.image}
                                       onChange={(event) => setValue('image', event.target.value)}/>
                            </Row>
                            <Row label="Кадрирование">
                                <select className={`${f.input} ${f.select}`} value={values.imageFit}
                                        onChange={(event) => setValue('imageFit', event.target.value)}>
                                    {Object.entries(IMAGE_FIT_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </Row>
                            <Row label="Градиент" hint="CSS-значение фона, если картинки нет" wide>
                                <input className={`${f.input} ${f.mono}`} type="text" value={values.gradient}
                                       onChange={(event) => setValue('gradient', event.target.value)}/>
                            </Row>
                        </Group>
                    )}

                    <Group title="Подписи">
                        <Row label="Надпись сверху" hint="Мелкая строка над заголовком: «Предзаказ», «Скидка»" wide>
                            <input className={f.input} type="text" value={values.subtitle}
                                   onChange={(event) => setValue('subtitle', event.target.value)}/>
                        </Row>
                        <Row label="Примечание" hint="Строка под ценой. У товара её заменяет дата акции" wide>
                            <input className={f.input} type="text" value={values.note}
                                   onChange={(event) => setValue('note', event.target.value)}/>
                        </Row>
                        <Row label="Ссылка" hint="Куда ведёт баннер. Пусто — открывается карточка товара" wide>
                            <input className={`${f.input} ${f.mono}`} type="text" placeholder="https://t.me/..."
                                   value={values.url}
                                   onChange={(event) => setValue('url', event.target.value)}/>
                        </Row>
                    </Group>

                    {type === 'product' ? (
                        <Group title="Перекрыть вручную">
                            <Row label="Заголовок" hint="Пусто — берём название товара" wide>
                                <input className={f.input} type="text"
                                       placeholder={source?.name || 'Название товара'}
                                       value={values.override.title}
                                       onChange={(event) => setOverride('title', event.target.value)}/>
                            </Row>
                            <Row label="Картинка" hint="Пусто — берём из карточки товара" wide>
                                <input className={`${f.input} ${f.mono}`} type="text" value={values.override.image}
                                       onChange={(event) => setOverride('image', event.target.value)}/>
                            </Row>
                            <Row label="Кадрирование" hint="Пусто — как решит сервер по наличию баннера 4:3">
                                <select className={`${f.input} ${f.select}`} value={values.override.imageFit}
                                        onChange={(event) => setOverride('imageFit', event.target.value)}>
                                    <option value="">Автоматически</option>
                                    {Object.entries(IMAGE_FIT_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </Row>
                        </Group>
                    ) : null}

                    <Group title="Показ">
                        <Row label="На всех витринах" hint="Иначе баннер виден только на этой странице">
                            <input type="checkbox" checked={values.everywhere}
                                   onChange={(event) => setValue('everywhere', event.target.checked)}/>
                        </Row>
                        <Row label="Скрыт" hint="Останется в списке, но пропадёт из карусели">
                            <input type="checkbox" checked={values.isHidden}
                                   onChange={(event) => setValue('isHidden', event.target.checked)}/>
                        </Row>
                    </Group>

                    <Group title="Как увидит покупатель">
                        <Row label="Превью" top wide>
                            <div className={s['bannerPreview']}>
                                <BannerPreview banner={previewBanner}/>
                                <span className={s['bannerHint']}>
                                    Цены и дата акции берутся из карточки товара при каждой отдаче —
                                    после парсинга баннер пересохранять не нужно.
                                </span>
                            </div>
                        </Row>
                    </Group>
                </Sheet>
            </div>

            <div className={s['formFooter']}>
                <button type="button" className={s['btn']} onClick={onCancel} disabled={saving}>Отмена</button>
                <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                        onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Сохранение…' : (isNew ? 'Создать' : 'Сохранить')}
                </button>
            </div>
        </div>
    );
};

export default BannerForm;
