import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import useData from '../../../useData';
import {useServer} from '../useServer';
import {useFeedback} from '../../../Elements/Feedback/Feedback';
import {BOT_OPTIONS} from '../EditPages/pageOptions';
import PopularPreview from './PopularPreview';
import style from './EditPopular.module.scss';

// ПОПУЛЯРНОЕ НА СТАРТЕ
// --------------------
// Карусель над списком витрин. Товары в неё не выводятся из каталогов: список
// собирается вручную и может смешивать позиции с разных страниц.
// Слева порядок и поиск товара, справа — та же карусель компонентом витрины.

const PLATFORMS = BOT_OPTIONS;

const SEARCH_DELAY_MS = 300;

const formatPrice = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number) || value === null || value === '') return '—';
    return `${number.toLocaleString('ru-RU')} ₽`;
};

const PopularScreen = () => {
    const {authenticationData} = useData();

    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;

    const authRef = useRef(authenticationData);
    authRef.current = authenticationData;

    const {showToast, confirm} = useFeedback();

    const [platform, setPlatform] = useState('tg');
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await serverRef.current.getPopularList();
            setAllItems(Array.isArray(result) ? result : []);
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить популярные позиции', 'error');
            setAllItems([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        load();
    }, [load]);

    const items = useMemo(
        () => allItems
            .filter((item) => item.platform === platform)
            .sort((a, b) => a.serialNumber - b.serialNumber),
        [allItems, platform],
    );

    const itemsRef = useRef([]);
    itemsRef.current = items;

    const chosenIds = useMemo(() => new Set(items.map((item) => item.productId)), [items]);

    useEffect(() => {
        const text = query.trim();
        if (text.length < 2) {
            setResults([]);
            return undefined;
        }

        const controller = new AbortController();
        const timerId = setTimeout(async () => {
            setSearching(true);
            try {
                setResults(await serverRef.current.searchBannerSources(text, controller.signal));
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
    }, [query, showToast]);

    const add = useCallback(async (product) => {
        setSaving(true);
        try {
            await serverRef.current.createPopular(authRef.current, platform, product.id);
            showToast(`«${product.name}» в популярном`, 'success');
            setQuery('');
            setResults([]);
            await load();
        } catch (error) {
            showToast(error.message || 'Не удалось добавить позицию', 'error');
        } finally {
            setSaving(false);
        }
    }, [platform, load, showToast]);

    const remove = useCallback(async (item) => {
        const name = item.product?.name || `ID ${item.productId}`;
        const agreed = await confirm({
            title: 'Убрать из популярного?',
            text: `«${name}» перестанет показываться в карусели стартового экрана.`,
            confirmLabel: 'Убрать',
            danger: true,
        });

        if (!agreed) return;

        setSaving(true);
        try {
            await serverRef.current.deletePopular(authRef.current, item.id);
            await load();
        } catch (error) {
            showToast(error.message || 'Не удалось убрать позицию', 'error');
        } finally {
            setSaving(false);
        }
    }, [confirm, load, showToast]);

    // Как и на стартовом экране: запрос уходит только по тем позициям,
    // у которых номер реально изменился
    const persistOrder = useCallback(async (reordered) => {
        const changed = reordered
            .map((item, index) => ({item, serialNumber: index}))
            .filter(({item, serialNumber}) => item.serialNumber !== serialNumber);

        if (!changed.length) return;

        setAllItems((prev) => prev.map((item) => {
            const patch = changed.find((entry) => entry.item.id === item.id);
            return patch ? {...item, serialNumber: patch.serialNumber} : item;
        }));

        setSaving(true);
        try {
            for (const {item, serialNumber} of changed) {
                await serverRef.current.updatePopular(authRef.current, item.id, {serialNumber});
            }
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить порядок', 'error');
            await load();
        } finally {
            setSaving(false);
        }
    }, [load, showToast]);

    const move = useCallback((item, offset) => {
        const list = [...itemsRef.current];
        const from = list.findIndex((entry) => entry.id === item.id);
        const to = from + offset;
        if (from === -1 || to < 0 || to >= list.length) return;

        const [moved] = list.splice(from, 1);
        list.splice(to, 0, moved);
        persistOrder(list);
    }, [persistOrder]);

    return (
        <div className={style['screen']}>
            <header className={style['header']}>
                <div className={style['headerTop']}>
                    <h1 className={style['title']}>Популярное на старте</h1>
                    <span className={style['counter']}>
                        {loading ? 'Загрузка…' : `${items.length} шт.`}
                    </span>
                    <span className={style['headerHint']}>
                        {saving ? 'Сохраняем…' : 'Карусель над списком витрин'}
                    </span>
                </div>

                <div className={style['toolbar']}>
                    <div className={style['segmented']}>
                        {PLATFORMS.map((item) => (
                            <button key={item.key} type="button"
                                    className={`${style['segment']} ${platform === item.key ? style['segmentActive'] : ''}`}
                                    onClick={() => setPlatform(item.key)}>
                                {item.name}
                            </button>
                        ))}
                    </div>

                    <button type="button" className={style['btn']} onClick={load}>Обновить</button>
                </div>
            </header>

            <div className={style['split']}>
                <section className={style['pane']}>
                    <div className={style['paneHead']}>
                        <span className={style['paneTitle']}>Порядок</span>
                        <span className={style['paneSubtitle']}>слева направо, как у покупателя</span>
                    </div>

                    <div className={style['search']}>
                        <input
                            className={style['input']}
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Найти товар по названию — минимум 2 символа"
                        />
                        <span className={style['searchNote']}>
                            {searching ? 'Ищем…' : results.length ? `${results.length} найдено` : ''}
                        </span>
                    </div>

                    {results.length ? (
                        <div className={style['results']}>
                            {results.map((product) => {
                                const already = chosenIds.has(product.id);

                                return (
                                    <div key={product.id} className={style['result']}>
                                        <span
                                            className={style['thumb']}
                                            style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                                        />
                                        <span className={style['resultBody']}>
                                            <span className={style['resultTitle']}>{product.name}</span>
                                            <span className={style['resultMeta']}>
                                                {product.typeLabel ? (
                                                    <span className={style['tag']}>{product.typeLabel}</span>
                                                ) : null}
                                                <span className={style['mono']}>{formatPrice(product.price)}</span>
                                            </span>
                                        </span>
                                        <button type="button" className={style['btn']}
                                                disabled={already || saving}
                                                onClick={() => add(product)}>
                                            {already ? 'Уже в списке' : 'Добавить'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}

                    <div className={style['listWrap']}>
                        {items.length === 0 ? (
                            <p className={style['empty']}>
                                {loading
                                    ? 'Загрузка…'
                                    : 'На этой площадке пусто — найдите товар выше и добавьте первым'}
                            </p>
                        ) : items.map((item, index) => {
                            const product = item.product;
                            const offSale = product ? product.onSale === false || product.isHidden === true : false;

                            return (
                                <div key={item.id} className={style['row']}>
                                    <span className={style['rowOrder']}>{index + 1}</span>
                                    <span
                                        className={style['thumb']}
                                        style={product?.image ? {backgroundImage: `url(${product.image})`} : undefined}
                                    />
                                    <span className={style['rowBody']}>
                                        <span className={style['rowTitle']}>
                                            {product?.name || `Товар удалён (ID ${item.productId})`}
                                        </span>
                                        <span className={style['rowMeta']}>
                                            {product?.typeLabel ? (
                                                <span className={style['tag']}>{product.typeLabel}</span>
                                            ) : null}
                                            <span className={style['mono']}>{formatPrice(product?.price)}</span>
                                            {!product || offSale ? (
                                                <span className={style['warn']}>
                                                    {!product ? 'нет в базе' : 'не в продаже — на витрине скрыт'}
                                                </span>
                                            ) : null}
                                        </span>
                                    </span>
                                    <span className={style['rowActions']}>
                                        <button type="button" className={style['iconBtn']}
                                                disabled={index === 0 || saving}
                                                onClick={() => move(item, -1)} aria-label="Левее">↑</button>
                                        <button type="button" className={style['iconBtn']}
                                                disabled={index === items.length - 1 || saving}
                                                onClick={() => move(item, 1)} aria-label="Правее">↓</button>
                                        <button type="button" className={`${style['iconBtn']} ${style['iconBtnDanger']}`}
                                                disabled={saving}
                                                onClick={() => remove(item)} aria-label="Убрать">✕</button>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className={style['pane']}>
                    <div className={style['paneHead']}>
                        <span className={style['paneTitle']}>Превью</span>
                        <span className={style['paneSubtitle']}>компонентом витрины</span>
                    </div>

                    <PopularPreview items={items}/>
                </section>
            </div>
        </div>
    );
};

export default PopularScreen;
