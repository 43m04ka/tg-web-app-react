import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import TabPane from '../../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../../Elements/FormLayout/FormLayout';
import s from '../EditStartPages/EditStartPages.module.scss';
import b from './EditBanners.module.scss';
import useData from '../../../useData';
import useGlobalData from '../../../../../hooks/useGlobalData';
import {useServer} from '../useServer';
import {useFeedback} from '../../../Elements/Feedback/Feedback';
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

// Из уже сохранённого баннера восстанавливаем карточку товара: список bannerSources
// при открытии формы пуст, а превью должно работать сразу, без повторного поиска.
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

const BannerForm = ({item, onClose, onSaved}) => {
    const isNew = !item?.id;
    const type = item?.type || 'product';

    const {authenticationData} = useData();
    const {pageList} = useGlobalData();
    const {createBanner, updateBanner, deleteBanner, searchBannerSources} = useServer();
    const {showToast, confirm} = useFeedback();

    const [values, setValues] = useState(() => {
        const data = item?.data || {};

        return {
            pageId: item?.pageId ?? null,
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

    const searchRef = useRef(searchBannerSources);
    searchRef.current = searchBannerSources;

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

    const availablePages = useMemo(
        () => (pageList || []).filter((page) => page.isHidden !== 1),
        [pageList],
    );

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

    const buildPayload = () => {
        if (type === 'product' && !source) {
            showToast('Выберите товар для баннера', 'error');
            return null;
        }

        const url = values.url.trim();
        if (url && !/^https?:\/\//i.test(url)) {
            showToast('URL должен начинаться с http:// или https://', 'error');
            return null;
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

        return {
            type,
            pageId: values.pageId,
            isHidden: values.isHidden ? 1 : 0,
            serialNumber: item?.serialNumber ?? 0,
            data,
        };
    };

    const handleSave = async () => {
        const payload = buildPayload();
        if (!payload) return;

        setSaving(true);
        try {
            if (isNew) {
                await createBanner(authenticationData, payload);
                showToast('Баннер добавлен', 'success');
            } else {
                await updateBanner(authenticationData, item.id, payload);
                showToast('Баннер сохранён', 'success');
            }

            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить баннер', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const agreed = await confirm({
            title: 'Удалить баннер?',
            text: 'Баннер пропадёт из карусели сразу. Действие необратимо.',
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        setSaving(true);
        try {
            await deleteBanner(authenticationData, item.id);
            showToast('Баннер удалён', 'success');
            onSaved?.();
            onClose();
        } catch (error) {
            showToast(error.message || 'Не удалось удалить баннер', 'error');
        } finally {
            setSaving(false);
        }
    };

    const pickSource = useCallback((product) => {
        setSource(product);
        setResults([]);
        setQuery('');
    }, []);

    return (
        <TabPane
            footer={(
                <>
                    <span className={s['formStatus']}>
                        {isNew ? `Новый баннер: ${TYPE_LABELS[type]}` : TYPE_LABELS[type]}
                    </span>
                    {!isNew ? (
                        <button type="button" className={`${s['btn']} ${s['btnDanger']}`}
                                disabled={saving} onClick={handleDelete}>
                            Удалить
                        </button>
                    ) : null}
                    <button type="button" className={s['btn']} onClick={onClose}>Отмена</button>
                    <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                            disabled={saving} onClick={handleSave}>
                        {saving ? 'Сохранение…' : (isNew ? 'Добавить' : 'Сохранить')}
                    </button>
                </>
            )}
        >
            <div className={b['formSplit']}>
                <Sheet>
                    {type === 'product' ? (
                        <Group title="Товар">
                            <Row label="Поиск" hint="Название игры, подписки или доната — от двух букв" top wide>
                                <div className={b['search']}>
                                    <input className={f.input} type="text"
                                           placeholder="Grand Theft Auto"
                                           value={query}
                                           onChange={(event) => setQuery(event.target.value)}/>

                                    {searching ? <span className={b['searchNote']}>Ищем…</span> : null}

                                    {results.length ? (
                                        <ul className={b['results']}>
                                            {results.map((product) => (
                                                <li key={product.id}>
                                                    <button type="button" className={b['result']}
                                                            onClick={() => pickSource(product)}>
                                                        <span className={b['resultImage']}
                                                              style={{
                                                                  backgroundImage: product.image ? `url(${product.image})` : 'none',
                                                                  backgroundPosition: product.imageFit === 'coverTop' ? 'top center' : 'center',
                                                              }}/>
                                                        <span className={b['resultBody']}>
                                                            <span className={b['resultName']}>{product.name}</span>
                                                            <span className={b['resultMeta']}>
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
                                    <div className={b['picked']}>
                                        <span className={b['pickedName']}>{source.name}</span>
                                        <span className={b['pickedMeta']}>
                                            ID {source.id} · {formatPrice(source.price) || 'без цены'}
                                            {source.oldPrice ? ` · было ${formatPrice(source.oldPrice)}` : ''}
                                            {source.promoEndDate ? ` · акция до ${formatPromoDate(source.promoEndDate)}` : ''}
                                        </span>
                                        <span className={b['pickedMeta']}>
                                            Картинка: {source.hasBanner
                                                ? 'баннер 4:3 из карточки'
                                                : 'баннера 4:3 нет — берём обложку и кадрируем по верхнему краю'}
                                        </span>
                                    </div>
                                ) : (
                                    <span className={s['formNote']}>Товар не выбран</span>
                                )}
                            </Row>
                        </Group>
                    ) : (
                        <Group title="Содержимое">
                            <Row label="Заголовок" wide>
                                <input className={f.input} type="text"
                                       value={values.title}
                                       onChange={(event) => setValue('title', event.target.value)}/>
                            </Row>
                            <Row label="Картинка" hint="Ссылка. Пусто — рисуем градиент" wide>
                                <input className={`${f.input} ${f.mono}`} type="text"
                                       value={values.image}
                                       onChange={(event) => setValue('image', event.target.value)}/>
                            </Row>
                            <Row label="Кадрирование">
                                <select className={`${f.input} ${f.select}`}
                                        value={values.imageFit}
                                        onChange={(event) => setValue('imageFit', event.target.value)}>
                                    {Object.entries(IMAGE_FIT_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </Row>
                            <Row label="Градиент" hint="CSS-значение фона, если картинки нет" wide>
                                <input className={`${f.input} ${f.mono}`} type="text"
                                       value={values.gradient}
                                       onChange={(event) => setValue('gradient', event.target.value)}/>
                            </Row>
                        </Group>
                    )}

                    <Group title="Подписи">
                        <Row label="Надпись сверху" hint="Мелкая строка над заголовком: «Предзаказ», «Скидка»" wide>
                            <input className={f.input} type="text"
                                   value={values.subtitle}
                                   onChange={(event) => setValue('subtitle', event.target.value)}/>
                        </Row>
                        <Row label="Примечание" hint="Строка под ценой. У товара её заменяет дата акции" wide>
                            <input className={f.input} type="text"
                                   value={values.note}
                                   onChange={(event) => setValue('note', event.target.value)}/>
                        </Row>
                        <Row label="Ссылка" hint="Куда ведёт баннер. Пусто — открывается карточка товара" wide>
                            <input className={`${f.input} ${f.mono}`} type="text"
                                   placeholder="https://t.me/..."
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
                                <input className={`${f.input} ${f.mono}`} type="text"
                                       value={values.override.image}
                                       onChange={(event) => setOverride('image', event.target.value)}/>
                            </Row>
                            <Row label="Кадрирование" hint="Пусто — как решит сервер по наличию баннера 4:3">
                                <select className={`${f.input} ${f.select}`}
                                        value={values.override.imageFit}
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
                        <Row label="Витрина" hint="«Все витрины» — баннер виден везде">
                            <select className={`${f.input} ${f.select}`}
                                    value={values.pageId ?? ''}
                                    onChange={(event) => setValue('pageId', event.target.value ? Number(event.target.value) : null)}>
                                <option value="">Все витрины</option>
                                {availablePages.map((page) => (
                                    <option key={page.id} value={page.id}>{page.name} (#{page.id})</option>
                                ))}
                            </select>
                        </Row>
                        <Row label="Скрыт" hint="Останется в списке, но пропадёт из карусели">
                            <input type="checkbox"
                                   checked={values.isHidden}
                                   onChange={(event) => setValue('isHidden', event.target.checked)}/>
                        </Row>
                    </Group>

                    {!isNew ? (
                        <Group title="Служебное">
                            <Row label="ID">
                                <span className={s['formValue']}>{item.id}</span>
                            </Row>
                            <Row label="Тип" hint="У существующего баннера не меняется: у типов разный набор полей">
                                <span className={s['formValue']}>{TYPE_LABELS[type]}</span>
                            </Row>
                        </Group>
                    ) : null}
                </Sheet>

                <aside className={b['formPreview']}>
                    <span className={b['previewTitle']}>Как увидит покупатель</span>
                    <BannerPreview banner={previewBanner}/>
                    <span className={b['previewHint']}>
                        Цены и дата акции берутся из карточки товара при каждой отдаче — после парсинга
                        баннер пересохранять не нужно.
                    </span>
                </aside>
            </div>
        </TabPane>
    );
};

export default BannerForm;
