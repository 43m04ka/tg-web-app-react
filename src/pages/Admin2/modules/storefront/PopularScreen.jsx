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
import {createPopular, deletePopular, fetchPopular, searchProducts, updatePopular} from './api';
import {
    POPULAR_PLATFORMS,
    alreadyAdded,
    byPlatform,
    movePopular,
    popularProblem,
    popularTitle
} from './popularModel';
import SectionTabs, {START_TABS} from './SectionTabs';
import style from './StorefrontScreen.module.scss';

const SEARCH_DELAY = 350;

export default function PopularScreen() {
    usePageHeader('Стартовый экран');

    const [platform, setPlatform] = useState('tg');
    const [query, setQuery] = useState('');
    const [found, setFound] = useState([]);
    const [busy, setBusy] = useState(false);

    const popular = useResource(keys.popular, fetchPopular);

    const all = useMemo(() => popular.data?.result || [], [popular.data]);
    const rows = useMemo(() => byPlatform(all, platform), [all, platform]);

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

            invalidate(keys.popular);
        } catch (error) {
            toastFail(error.message || 'Не получилось переставить', error.hint || '');

            invalidate(keys.popular);
        } finally {
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

    if (popular.error && !popular.data) {
        return (
            <Workspace>
                <ErrorState error={popular.error} onRetry={popular.refresh}/>
            </Workspace>
        );
    }

    return (
        <div className={style.sectionScreen}>
        <SectionTabs items={START_TABS}/>
        <Workspace>
            <HeaderActions>
                <Button size="s" variant="ghost" onClick={popular.refresh}>Обновить</Button>
            </HeaderActions>

            <Panel
                title="Популярное на старте"
                subtitle={rows.length ? `${rows.length} позиций` : ''}
                wide
                scroll
                actions={(
                    <Select
                        options={POPULAR_PLATFORMS}
                        value={platform}
                        onChange={(event) => setPlatform(event.target.value)}
                    />
                )}
            >
                <Note tone="neutral">
                    Карусель на стартовом экране. Порядок здесь — порядок в ней.
                    У каждой площадки свой список.
                </Note>

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
                                    style={item.product?.image
                                        ? {backgroundImage: `url(${item.product.image})`}
                                        : undefined}
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
                                    <IconButton
                                        label="Выше"
                                        disabled={index === 0 || busy}
                                        onClick={() => reorder(item.id, -1)}
                                    >
                                        ↑
                                    </IconButton>
                                    <IconButton
                                        label="Ниже"
                                        disabled={index === rows.length - 1 || busy}
                                        onClick={() => reorder(item.id, 1)}
                                    >
                                        ↓
                                    </IconButton>
                                    <IconButton label="Убрать" onClick={() => remove(item)}>×</IconButton>
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Panel>

            <Panel title="Добавить товар" scroll>
                <Input
                    value={query}
                    placeholder="Название товара, от двух знаков"
                    onChange={(event) => setQuery(event.target.value)}
                />

                {found.length === 0 && query.trim().length >= 2 ? (
                    <Note tone="neutral">Ничего не нашлось</Note>
                ) : null}

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
            </Panel>
        </Workspace>
        </div>
    );
}
