import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    EmptyState,
    ErrorState,
    IconButton,
    Input,
    Money,
    Note,
    Panel,
    Select,
    SkeletonRows,
    Workspace
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {
    createPopular,
    deletePopular,
    fetchPages,
    fetchPopular,
    fetchStartPages,
    searchProducts,
    updatePopular,
    updateStartItem
} from './api';
import {START_PLATFORMS, byPlatform, moveStart, orphanWarning, startTitle, toGroups, typeTitle} from './startModel';
import {
    alreadyAdded,
    byPlatform as popularOf,
    movePopular,
    popularProblem,
    popularTitle
} from './popularModel';
import StartPageInspector from './StartPageInspector';
import StartPreview from './StartPreview';
import style from './StorefrontScreen.module.scss';

const SEARCH_DELAY = 350;

function StartPanel({start, rows, pageList, onEdit}) {
    const [isBusy, setBusy] = useState(false);
    const orphans = orphanWarning(rows);

    const reorder = useCallback(async (id, delta) => {
        const moved = moveStart(rows, id, delta);
        if (!moved || isBusy) return;

        setBusy(true);

        try {
            const changed = moved.filter((item) => {
                const before = rows.find((row) => row.id === item.id);
                return before && before.serialNumber !== item.serialNumber;
            });

            for (const item of changed) {
                await updateStartItem(item.id, {serialNumber: item.serialNumber});
            }
        } catch (error) {
            toastFail(error.message || 'Не получилось переставить', error.hint || '');
        } finally {
            invalidate(keys.startPages);
            setBusy(false);
        }
    }, [rows, isBusy]);

    return (
        <Panel
            title="Стартовый экран"
            subtitle="Первое, что видит покупатель"
            scroll
            actions={(
                <Button size="s" variant="primary" onClick={() => onEdit(null)}>
                    Добавить
                </Button>
            )}
        >
            <Note tone="neutral">
                Порядок здесь — это и есть порядок на экране. Заголовок начинает новую группу,
                и всё, что идёт под ним, попадает в неё.
            </Note>

            {orphans ? <Note tone="warning">{orphans}</Note> : null}

            {start.isLoading && !start.data ? <SkeletonRows count={5}/> : null}

            {start.data && rows.length === 0 ? (
                <EmptyState
                    title="Для этой площадки экран пуст"
                    text="Покупатель попадёт сразу на первую доступную витрину."
                />
            ) : null}

            <div className={style.blocks}>
                {rows.map((item, index) => (
                    <div key={item.id} className={style.block}>
                        <span className={style.blockOrder}>{index + 1}</span>

                        <span className={style.blockBody}>
                            <span className={style.blockTitle}>{startTitle(item, pageList)}</span>
                            <span className={style.blockNote}>
                                {typeTitle(item.type)}
                                {item.type === 'link' && item.url ? ` · ${item.url}` : ''}
                            </span>
                        </span>

                        {item.type === 'title' ? <Badge tone="accent">группа</Badge> : null}

                        <span className={style.blockTools}>
                            <IconButton label="Выше" disabled={index === 0 || isBusy} onClick={() => reorder(item.id, -1)}>↑</IconButton>
                            <IconButton label="Ниже" disabled={index === rows.length - 1 || isBusy} onClick={() => reorder(item.id, 1)}>↓</IconButton>
                            <Button size="s" variant="ghost" onClick={() => onEdit(item)}>Править</Button>
                        </span>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

function PopularPanel({platform, popular, all, rows}) {
    const [query, setQuery] = useState('');
    const [found, setFound] = useState([]);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (query.trim().length < 2) {
            setFound([]);
            return undefined;
        }

        const timerId = setTimeout(() => {
            searchProducts(query.trim())
                .then((payload) => setFound(payload?.items || payload?.result || []))
                .catch(() => setFound([]));
        }, SEARCH_DELAY);

        return () => clearTimeout(timerId);
    }, [query]);

    const add = useCallback(async (product) => {
        if (alreadyAdded(all, platform, product.id)) {
            toastFail('Этот товар уже в популярном на этой площадке', '');
            return;
        }

        setBusy(true);

        try {
            await createPopular({platform, productId: product.id});
            invalidate(keys.popular);
            setQuery('');
            setFound([]);
            toast({tone: 'positive', title: 'Добавлено в популярное'});
        } catch (error) {
            toastFail(error.message || 'Не получилось добавить', error.hint || '');
        } finally {
            setBusy(false);
        }
    }, [all, platform]);

    const reorder = useCallback(async (id, delta) => {
        const moved = movePopular(rows, id, delta);
        if (!moved || busy) return;

        setBusy(true);

        try {
            const changed = moved.filter((item) => {
                const before = rows.find((row) => row.id === item.id);
                return before && before.serialNumber !== item.serialNumber;
            });

            for (const item of changed) {
                await updatePopular(item.id, {serialNumber: item.serialNumber});
            }
        } catch (error) {
            toastFail(error.message || 'Не получилось переставить', error.hint || '');
        } finally {
            invalidate(keys.popular);
            setBusy(false);
        }
    }, [rows, busy]);

    const remove = useCallback(async (item) => {
        const answer = await askConfirm({
            title: 'Убрать из популярного?',
            text: popularTitle(item),
            confirmText: 'Убрать',
            tone: 'danger'
        });

        if (!answer) return;

        try {
            await deletePopular(item.id);
            invalidate(keys.popular);
        } catch (error) {
            toastFail(error.message || 'Не получилось убрать', error.hint || '');
        }
    }, []);

    return (
        <Panel
            title="Популярное на старте"
            subtitle={rows.length ? `${rows.length} позиций` : 'Карусель на стартовом экране'}
            scroll
        >
            <Input
                value={query}
                placeholder="Добавить товар: название, от двух знаков"
                onChange={(event) => setQuery(event.target.value)}
            />

            {found.length === 0 && query.trim().length >= 2 ? (
                <Note tone="neutral">Ничего не нашлось</Note>
            ) : null}

            {found.length ? (
                <div className={style.found}>
                    {found.map((product) => {
                        const added = alreadyAdded(all, platform, product.id);

                        return (
                            <button
                                key={product.id}
                                type="button"
                                className={style.foundItem}
                                disabled={added || busy}
                                onClick={() => add(product)}
                            >
                                <span
                                    className={style.foundArt}
                                    style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                                />

                                <span className={style.foundBody}>
                                    <span className={style.foundName}>{product.name}</span>
                                    <span className={style.foundMeta}>
                                        №{product.id}
                                        {added ? ' · уже добавлен' : ''}
                                        {!added && !product.onSale ? ' · снят с продажи' : ''}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : null}

            {popular.isLoading && !popular.data ? <SkeletonRows count={4}/> : null}

            {popular.data && rows.length === 0 ? (
                <EmptyState
                    title="Для этой площадки список пуст"
                    text="Карусель популярного на стартовом экране не появится."
                />
            ) : null}

            <div className={style.blocks}>
                {rows.map((item, index) => {
                    const problem = popularProblem(item);

                    return (
                        <div key={item.id} className={style.block}>
                            <span className={style.blockOrder}>{index + 1}</span>

                            <span
                                className={style.bannerArt}
                                style={item.product?.image ? {backgroundImage: `url(${item.product.image})`} : undefined}
                            />

                            <span className={style.blockBody}>
                                <span className={style.blockTitle}>{popularTitle(item)}</span>
                                <span className={style.blockNote}>
                                    №{item.productId}
                                    {item.product?.price ? <> · <Money value={item.product.price}/></> : null}
                                </span>
                            </span>

                            {problem ? <Badge tone="warning">{problem}</Badge> : null}

                            <span className={style.blockTools}>
                                <IconButton label="Выше" disabled={index === 0 || busy} onClick={() => reorder(item.id, -1)}>↑</IconButton>
                                <IconButton label="Ниже" disabled={index === rows.length - 1 || busy} onClick={() => reorder(item.id, 1)}>↓</IconButton>
                                <IconButton label="Убрать" onClick={() => remove(item)}>×</IconButton>
                            </span>
                        </div>
                    );
                })}
            </div>
        </Panel>
    );
}

export default function MobileMainScreen() {
    usePageHeader('Главная (МОБ)');

    const [platform, setPlatform] = useState('tg');
    const [editing, setEditing] = useState(null);

    const start = useResource(keys.startPages, fetchStartPages);
    const pages = useResource(keys.pages, fetchPages);
    const popular = useResource(keys.popular, fetchPopular);

    const startAll = useMemo(() => start.data?.result || [], [start.data]);
    const startRows = useMemo(() => byPlatform(startAll, platform), [startAll, platform]);
    const pageList = useMemo(() => pages.data?.result || [], [pages.data]);
    const groups = useMemo(() => toGroups(startRows), [startRows]);

    const popularAll = useMemo(() => popular.data?.result || [], [popular.data]);
    const popularRows = useMemo(() => popularOf(popularAll, platform), [popularAll, platform]);
    const previewPopular = useMemo(() => popularRows.filter((item) => item.product), [popularRows]);

    const refresh = useCallback(() => {
        start.refresh();
        popular.refresh();
    }, [start, popular]);

    if (start.error && !start.data) {
        return (
            <Workspace>
                <ErrorState error={start.error} onRetry={start.refresh}/>
            </Workspace>
        );
    }

    return (
        <Workspace>
            <HeaderActions>
                <Select
                    options={START_PLATFORMS}
                    value={platform}
                    onChange={(event) => {
                        setEditing(null);
                        setPlatform(event.target.value);
                    }}
                />
                <Button size="s" variant="ghost" onClick={refresh}>Обновить</Button>
            </HeaderActions>

            <StartPanel
                start={start}
                rows={startRows}
                pageList={pageList}
                onEdit={(item) => setEditing({item})}
            />

            {popular.error && !popular.data ? (
                <Panel title="Популярное на старте">
                    <ErrorState error={popular.error} onRetry={popular.refresh}/>
                </Panel>
            ) : (
                <PopularPanel platform={platform} popular={popular} all={popularAll} rows={popularRows}/>
            )}

            <aside className={style.preview}>
                <header className={style.previewHead}>
                    <span className={style.previewTitle}>Как увидит покупатель</span>
                </header>

                <div className={style.previewBody}>
                    {groups.length === 0 ? (
                        <p className={style.previewEmpty}>Пока нечего показывать</p>
                    ) : (
                        <StartPreview rows={startRows} pages={pageList} popular={previewPopular}/>
                    )}
                </div>
            </aside>

            {editing ? (
                <StartPageInspector
                    key={editing.item?.id ?? 'new'}
                    item={editing.item}
                    platform={platform}
                    pages={pageList}
                    count={startRows.length}
                    onClose={() => setEditing(null)}
                />
            ) : null}
        </Workspace>
    );
}
