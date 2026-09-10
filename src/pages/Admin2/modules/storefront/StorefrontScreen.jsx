import React, {useCallback, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Badge,
    Button,
    EmptyState,
    ErrorState,
    IconButton,
    Note,
    Panel,
    SkeletonRows,
    Tabs,
    Workspace
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {deleteBlock, fetchBlocks, fetchCatalogs, fetchPages, refreshStructure, updateBlock} from './api';
import {GROUPS, describeBlock, moveBlock, sortBlocks} from './blockKinds';
import {PRICING_NOTES, groupByBot, hasStructure, typeName} from './pageOptions';
import BlockInspector from './BlockInspector';
import BlockRow from './BlockRow';
import PageInspector from './PageInspector';
import StorefrontPreview from './StorefrontPreview';
import StorefrontTabs from './StorefrontTabs';
import style from './StorefrontScreen.module.scss';

export default function StorefrontScreen() {
    usePageHeader('Витрина');

    const navigate = useNavigate();
    const {pageId} = useParams();

    const [group, setGroup] = useState('body');
    const [editing, setEditing] = useState(null);
    const [isBusy, setBusy] = useState(false);

    const pages = useResource(keys.pages, fetchPages);
    const catalogs = useResource(keys.catalogList, fetchCatalogs);
    const catalogByPath = useMemo(() => {
        const list = Array.isArray(catalogs.data) ? catalogs.data : catalogs.data?.result || [];
        return new Map(list.map((catalog) => [catalog.path, catalog]));
    }, [catalogs.data]);
    const list = useMemo(() => pages.data?.result || [], [pages.data]);

    const current = useMemo(
        () => list.find((page) => String(page.id) === String(pageId)) || null,
        [list, pageId]
    );

    const blocks = useResource(
        keys.pageBlocks(current?.id ?? 0, group),
        () => fetchBlocks(current.id, group),
        {enabled: Boolean(current) && hasStructure(current.type)}
    );

    const rows = useMemo(() => sortBlocks(blocks.data?.result), [blocks.data]);

    const openPage = useCallback((next) => {
        setEditing(null);
        navigate(`/admin2/storefront/page/${next.id}`);
    }, [navigate]);

    const reorder = useCallback(async (id, delta) => {
        const moved = moveBlock(rows, id, delta);
        if (!moved || isBusy) return;

        setBusy(true);

        try {
            const changed = moved.filter((item) => {
                const before = rows.find((row) => row.id === item.id);
                return before && before.serialNumber !== item.serialNumber;
            });

            for (const item of changed) {
                await updateBlock(item.id, {serialNumber: item.serialNumber});
            }

            invalidate(keys.pageBlocks(current.id, group));
        } catch (error) {
            toastFail(error.message || 'Не получилось переставить', error.hint || '');

            invalidate(keys.pageBlocks(current.id, group));
        } finally {
            setBusy(false);
        }
    }, [rows, isBusy, current, group]);

    const removeBlock = useCallback(async (item) => {
        const answer = await askConfirm({
            title: 'Убрать блок с витрины?',
            text: describeBlock(item, group),
            consequence: 'Блок исчезнет у покупателей после пересборки витрины.',
            confirmText: 'Убрать',
            tone: 'danger'
        });

        if (!answer) return;

        try {
            await deleteBlock(item.id);
            invalidate(keys.pageBlocks(current.id, group));
            toast({tone: 'positive', title: 'Блок убран'});
        } catch (error) {
            toastFail(error.message || 'Не получилось убрать', error.hint || '');
        }
    }, [group, current]);

    const rebuild = useCallback(async () => {
        try {
            await refreshStructure();
            toast({
                tone: 'positive',
                title: 'Витрина пересобрана',
                text: 'Покупатели увидят изменения при следующем открытии.'
            });
        } catch (error) {
            toastFail(error.message || 'Пересборка не прошла', error.hint || '');
        }
    }, []);

    if (pages.error && !pages.data) {
        return (
            <Workspace>
                <ErrorState error={pages.error} onRetry={pages.refresh}/>
            </Workspace>
        );
    }

    const structural = current && hasStructure(current.type);

    return (
        <Workspace>
            <HeaderActions>
                <StorefrontTabs/>
                <Button size="s" variant="ghost" onClick={pages.refresh}>Обновить</Button>
                <Button size="s" variant="secondary" onClick={rebuild}>Пересобрать витрину</Button>
            </HeaderActions>

            <Panel
                title="Страницы"
                grow={0.85}
                scroll
                actions={<Button size="s" variant="primary" onClick={() => setEditing({kind: 'page', item: null})}>
                    Новая
                </Button>}
            >
                {pages.isLoading && !pages.data ? <SkeletonRows count={6}/> : null}

                {groupByBot(list).map((bucket) => (
                    <div key={bucket.botType} className={style.bucket}>
                        <span className={style.bucketTitle}>
                            {bucket.title}
                            <span className={style.bucketCount}>{bucket.items.length}</span>
                        </span>

                        {bucket.items.map((page) => (
                            <button
                                key={page.id}
                                type="button"
                                className={`${style.page} ${current?.id === page.id ? style.pageActive : ''}`}
                                onClick={() => openPage(page)}
                            >
                                <span className={style.pageIcon}>{(page.name || '?').trim().slice(0, 1).toUpperCase()}</span>

                                <span className={style.pageText}>
                                    <span className={style.pageName}>{page.name || 'Без названия'}</span>

                                    <span className={style.pageMeta}>
                                        {typeName(page.type)}
                                        <span className={style.pageId}>#{page.id}</span>
                                        {page.isHidden ? <Badge tone="neutral">скрыта</Badge> : null}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                ))}
            </Panel>

            <Panel
                title={current ? current.name || 'Страница' : 'Блоки'}
                subtitle={current ? typeName(current.type) : ''}
                wide
                scroll
                actions={current ? (
                    <>
                        <Button size="s" variant="ghost" onClick={() => setEditing({kind: 'page', item: current})}>
                            Настройки страницы
                        </Button>

                        {structural ? (
                            <Button size="s" variant="primary" onClick={() => setEditing({kind: 'block', item: null})}>
                                Добавить блок
                            </Button>
                        ) : null}
                    </>
                ) : null}
            >
                {!current ? (
                    <EmptyState
                        title="Выберите страницу"
                        text="Слева — площадки и их страницы. Внутри страницы собирается то, что покупатель видит на главной."
                    />
                ) : !structural ? (
                    <Note tone="neutral">
                        {PRICING_NOTES[current.type] || 'Эта витрина собирается не блоками.'}
                        {' '}Содержимое правится в своём разделе.
                    </Note>
                ) : (
                    <>
                        <Tabs
                            items={GROUPS.map((item) => ({id: item.value, title: item.title, count: item.value === group ? rows.length : undefined}))}
                            value={group}
                            onChange={setGroup}
                        />

                        {group === 'head' ? (
                            <Note tone="warning">
                                Витрина эти блоки не показывает: карусель наверху собирается из
                                баннеров, а не из блоков страницы. Здесь лежат записи прежней
                                витрины — править их можно, но покупатель их не увидит.
                            </Note>
                        ) : null}

                        {blocks.isLoading && !blocks.data ? <SkeletonRows count={5}/> : null}
                        {blocks.error ? <ErrorState error={blocks.error} onRetry={blocks.refresh}/> : null}

                        {blocks.data && rows.length === 0 ? (
                            <EmptyState
                                title={group === 'head' ? 'Карусель пуста' : 'На странице нет блоков'}
                                text="Добавьте блок — он появится у покупателя после пересборки витрины."
                            />
                        ) : null}

                        <div className={style.blocks}>
                            {rows.map((item, index) => (
                                <BlockRow
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    group={group}
                                    catalog={catalogByPath.get(item.path) || null}
                                    isFirst={index === 0}
                                    isLast={index === rows.length - 1}
                                    isBusy={isBusy}
                                    onMove={reorder}
                                    onEdit={(block) => setEditing({kind: 'block', item: block})}
                                    onRemove={removeBlock}
                                />
                            ))}
                        </div>
                    </>
                )}
            </Panel>

            <StorefrontPreview page={current} blocks={rows}/>

            {editing?.kind === 'page' ? (
                <PageInspector
                    page={editing.item}
                    onClose={() => setEditing(null)}
                    onRemoved={() => navigate('/admin2/storefront')}
                />
            ) : null}

            {editing?.kind === 'block' && current ? (
                <BlockInspector
                    block={editing.item}
                    group={group}
                    page={current}
                    count={rows.length}
                    onClose={() => setEditing(null)}
                />
            ) : null}
        </Workspace>
    );
}
