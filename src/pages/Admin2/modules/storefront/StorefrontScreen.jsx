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
import {deleteBlock, fetchBanners, fetchBlocks, fetchCatalogs, fetchPages, refreshStructure, updateBlock} from './api';
import {describeBlock, moveBlock, sortBlocks} from './blockKinds';
import {bannersFor, sortBanners} from './bannerModel';
import {PRICING_NOTES, hasStructure, isMainPage, sortPages, typeName} from './pageOptions';
import BannerInspector from './BannerInspector';
import BlockInspector from './BlockInspector';
import BlockRow from './BlockRow';
import PageBanners from './PageBanners';
import PageInspector from './PageInspector';
import StorefrontPreview from './StorefrontPreview';
import style from './StorefrontScreen.module.scss';

const PAGE_TABS = [
    {value: 'body', title: 'Содержимое'},
    {value: 'banners', title: 'Баннеры'}
];

const DEVICE_TABS = [
    {value: 'mobile', title: 'Баннеры мобильной версии'},
    {value: 'pc', title: 'Баннеры ПК-версии'}
];

export default function StorefrontScreen() {
    usePageHeader('Витрины');

    const navigate = useNavigate();
    const {pageId} = useParams();

    const [tab, setTab] = useState('body');
    const [device, setDevice] = useState('mobile');
    const [editing, setEditing] = useState(null);
    const [isBusy, setBusy] = useState(false);

    const pages = useResource(keys.pages, fetchPages);
    const catalogs = useResource(keys.catalogList, fetchCatalogs);
    const catalogByPath = useMemo(() => {
        const list = Array.isArray(catalogs.data) ? catalogs.data : catalogs.data?.result || [];
        return new Map(list.map((catalog) => [catalog.path, catalog]));
    }, [catalogs.data]);
    const list = useMemo(() => pages.data?.result || [], [pages.data]);
    const storefronts = useMemo(() => sortPages(list).filter((page) => !isMainPage(page)), [list]);

    const current = useMemo(
        () => storefronts.find((page) => String(page.id) === String(pageId)) || null,
        [storefronts, pageId]
    );

    const banners = useResource(keys.banners, fetchBanners);
    const allBanners = useMemo(() => sortBanners(banners.data?.result), [banners.data]);
    const mobileBanners = useMemo(
        () => (current ? bannersFor(allBanners, current.id, 'mobile') : []),
        [allBanners, current]
    );
    const pcBanners = useMemo(
        () => (current ? bannersFor(allBanners, current.id, 'pc') : []),
        [allBanners, current]
    );
    const deviceBanners = device === 'pc' ? pcBanners : mobileBanners;

    const blocks = useResource(
        keys.pageBlocks(current?.id ?? 0),
        () => fetchBlocks(current.id),
        {enabled: Boolean(current) && hasStructure(current.type)}
    );

    const rows = useMemo(() => sortBlocks(blocks.data?.result), [blocks.data]);

    const openPage = useCallback((next) => {
        setEditing(null);
        navigate(`/admin/storefront/page/${next.id}`);
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

            invalidate(keys.pageBlocks(current.id));
        } catch (error) {
            toastFail(error.message || 'Не получилось переставить', error.hint || '');

            invalidate(keys.pageBlocks(current.id));
        } finally {
            setBusy(false);
        }
    }, [rows, isBusy, current]);

    const removeBlock = useCallback(async (item) => {
        const answer = await askConfirm({
            title: 'Убрать блок с витрины?',
            text: describeBlock(item),
            consequence: 'Блок исчезнет у покупателей после пересборки витрины.',
            confirmText: 'Убрать',
            tone: 'danger'
        });

        if (!answer) return;

        try {
            await deleteBlock(item.id);
            invalidate(keys.pageBlocks(current.id));
            toast({tone: 'positive', title: 'Блок убран'});
        } catch (error) {
            toastFail(error.message || 'Не получилось убрать', error.hint || '');
        }
    }, [current]);

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

                <div className={style.bucket}>
                    {storefronts.map((page) => (
                        <div key={page.id} className={style.pageRow}>
                            <button
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

                            <button
                                type="button"
                                className={style.pageSettings}
                                title="Настройки страницы"
                                aria-label="Настройки страницы"
                                onClick={() => setEditing({kind: 'page', item: page})}
                            >
                                ⚙
                            </button>
                        </div>
                    ))}
                </div>
            </Panel>

            <Panel
                title={current ? current.name || 'Страница' : 'Блоки'}
                subtitle={current ? typeName(current.type) : ''}
                wide
                scroll
                actions={current && structural && tab === 'body' ? (
                    <Button size="s" variant="primary" onClick={() => setEditing({kind: 'block', item: null})}>
                        Добавить блок
                    </Button>
                ) : null}
            >
                {!current ? (
                    <EmptyState
                        title="Выберите страницу"
                        text="Слева — витрины. Внутри витрины собираются её каталоги и баннеры мобильной и ПК-версии."
                    />
                ) : !structural ? (
                    <Note tone="neutral">
                        {PRICING_NOTES[current.type] || 'Эта витрина собирается не блоками.'}
                        {' '}Содержимое правится в своём разделе.
                    </Note>
                ) : (
                    <>
                        <Tabs
                            items={PAGE_TABS.map((item) => ({
                                id: item.value,
                                title: item.title,
                                count: item.value === 'banners' ? mobileBanners.length + pcBanners.length : rows.length
                            }))}
                            value={tab}
                            onChange={(next) => {
                                setEditing(null);
                                setTab(next);
                            }}
                        />

                        {tab === 'banners' ? (
                            <>
                                <div className={style.deviceTabs}>
                                    <Tabs
                                        items={DEVICE_TABS.map((item) => ({
                                            id: item.value,
                                            title: item.title,
                                            count: item.value === 'pc' ? pcBanners.length : mobileBanners.length
                                        }))}
                                        value={device}
                                        onChange={(next) => {
                                            setEditing(null);
                                            setDevice(next);
                                        }}
                                    />
                                </div>

                                <PageBanners
                                    key={device}
                                    rows={deviceBanners}
                                    all={allBanners}
                                    pages={list}
                                    isLoading={banners.isLoading && !banners.data}
                                    bySlot={device === 'pc'}
                                    onEdit={(item, slot = 'main') => setEditing({kind: 'banner', item, slot})}
                                />
                            </>
                        ) : (
                            <>
                            {blocks.isLoading && !blocks.data ? <SkeletonRows count={5}/> : null}
                            {blocks.error ? <ErrorState error={blocks.error} onRetry={blocks.refresh}/> : null}

                            {blocks.data && rows.length === 0 ? (
                                <EmptyState
                                    title='На странице нет блоков'
                                    text="Добавьте блок — он появится у покупателя после пересборки витрины."
                                />
                            ) : null}

                            <div className={style.blocks}>
                                {rows.map((item, index) => (
                                    <BlockRow
                                        key={item.id}
                                        item={item}
                                        index={index}
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
                    </>
                )}
            </Panel>

            <StorefrontPreview page={current} blocks={rows} banners={mobileBanners.filter((item) => !item.isHidden)}/>

            {editing?.kind === 'page' ? (
                <PageInspector
                    page={editing.item}
                    onClose={() => setEditing(null)}
                    onRemoved={() => navigate('/admin/storefront')}
                />
            ) : null}

            {editing?.kind === 'banner' && current ? (
                <BannerInspector
                    key={editing.item?.id ?? `new-${device}-${editing.slot}`}
                    banner={editing.item}
                    pages={list}
                    count={allBanners.length}
                    pageId={current.id}
                    slot={editing.slot}
                    device={device}
                    onClose={() => setEditing(null)}
                />
            ) : null}

            {editing?.kind === 'block' && current ? (
                <BlockInspector
                    key={editing.item?.id ?? 'new'}
                    block={editing.item}
                    page={current}
                    count={rows.length}
                    onClose={() => setEditing(null)}
                />
            ) : null}
        </Workspace>
    );
}
