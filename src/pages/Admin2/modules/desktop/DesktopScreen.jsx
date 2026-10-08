import React, {useCallback, useMemo, useState} from 'react';
import {Badge, Button, EmptyState, ErrorState, IconButton, Note, Panel, SkeletonRows, Tabs, Workspace} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {fetchBanners, fetchCatalogs, fetchPages} from '../storefront/api';
import {sortBanners} from '../storefront/bannerModel';
import PageBanners from '../storefront/PageBanners';
import {fetchAllBlocks, fetchDesktopShelves, updateDesktopShelf} from './api';
import {catalogOptions, listOf, moveShelf, optionIndex, sortShelves, withDraft} from './desktopModel';
import DesktopPreview from './DesktopPreview';
import ShelfInspector from './ShelfInspector';
import style from './DesktopScreen.module.scss';

export default function DesktopScreen() {
    usePageHeader('ПК-версия');

    const [tab, setTab] = useState('shelves');
    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState(null);
    const [isBusy, setBusy] = useState(false);

    const shelves = useResource(keys.desktopShelves, fetchDesktopShelves);
    const pages = useResource(keys.pages, fetchPages);
    const catalogs = useResource(keys.catalogList, fetchCatalogs);
    const blocks = useResource(keys.allBlocks, fetchAllBlocks);
    const banners = useResource(keys.banners, fetchBanners);

    const rows = useMemo(() => sortShelves(listOf(shelves.data)), [shelves.data]);
    const pageList = useMemo(() => listOf(pages.data), [pages.data]);
    const mainPage = useMemo(() => pageList.find((page) => page.type === 'main') || null, [pageList]);

    const groups = useMemo(
        () => catalogOptions({catalogs: listOf(catalogs.data), pages: pageList, blocks: listOf(blocks.data)}),
        [catalogs.data, pageList, blocks.data]
    );
    const byId = useMemo(() => optionIndex(groups), [groups]);

    const allBanners = useMemo(() => sortBanners(listOf(banners.data)), [banners.data]);
    const pcBanners = useMemo(
        () => (mainPage ? allBanners.filter((item) => item.pageId === mainPage.id && item.data?.device !== 'mobile') : []),
        [allBanners, mainPage]
    );

    const previewShelves = useMemo(() => withDraft(rows, editing, draft), [rows, editing, draft]);
    const previewBanners = useMemo(() => allBanners.filter((item) => !item.isHidden), [allBanners]);

    const open = useCallback((item) => {
        setDraft(null);
        setEditing({item});
    }, []);

    const close = useCallback(() => {
        setEditing(null);
        setDraft(null);
    }, []);

    const reorder = useCallback(async (id, delta) => {
        const moved = moveShelf(rows, id, delta);
        if (!moved || isBusy) return;

        setBusy(true);

        try {
            for (const item of moved) {
                const before = rows.find((row) => row.id === item.id);
                if (before && before.serialNumber !== item.serialNumber) {
                    await updateDesktopShelf(item.id, {serialNumber: item.serialNumber});
                }
            }
        } catch (error) {
            toastFail(error.message || 'Не получилось переставить', error.hint || '');
        } finally {
            invalidate(keys.desktopShelves);
            setBusy(false);
        }
    }, [rows, isBusy]);

    const toggleHidden = useCallback(async (item) => {
        try {
            await updateDesktopShelf(item.id, {isHidden: item.isHidden ? 0 : 1});
            invalidate(keys.desktopShelves);
        } catch (error) {
            toastFail(error.message || 'Не получилось переключить', error.hint || '');
        }
    }, []);

    if (shelves.error && !shelves.data) {
        return (
            <Workspace>
                <ErrorState error={shelves.error} onRetry={shelves.refresh}/>
            </Workspace>
        );
    }

    return (
        <Workspace>
            <HeaderActions>
                <Button size="s" variant="ghost" onClick={shelves.refresh}>Обновить</Button>
            </HeaderActions>

            <div className={style.layout}>
                <div className={style.editor}>
                    <Panel
                        title="Главная ПК"
                        subtitle="Первая страница сайта на компьютере"
                        wide
                        scroll
                        actions={tab === 'shelves' ? (
                            <Button size="s" variant="primary" onClick={() => open(null)}>Новый сводный каталог</Button>
                        ) : null}
                    >
                        <Tabs
                            items={[
                                {id: 'shelves', title: 'Сводные каталоги', count: rows.length},
                                {id: 'banners', title: 'Баннеры', count: pcBanners.length}
                            ]}
                            value={tab}
                            onChange={setTab}
                        />

                        {tab === 'banners' ? (
                            mainPage ? (
                                <PageBanners
                                    page={mainPage}
                                    rows={pcBanners}
                                    all={allBanners}
                                    total={allBanners.length}
                                    pages={pageList}
                                    isLoading={banners.isLoading && !banners.data}
                                />
                            ) : <SkeletonRows count={4}/>
                        ) : (
                            <>
                                <div className={style.intro}>
                                    <Note tone="neutral">
                                        Сводный каталог — это полка на главной ПК. Создайте его и отметьте обычные
                                        каталоги разных витрин: их товары соберутся в одну полку, одинаковые игры
                                        склеятся в одну карточку с лучшей ценой. Порядок полок — стрелками.
                                    </Note>
                                </div>

                                {shelves.isLoading && !shelves.data ? <SkeletonRows count={5}/> : null}

                                {shelves.data && rows.length === 0 ? (
                                    <EmptyState
                                        title="Сводных каталогов нет"
                                        text="Пока их нет, главная ПК собирает полки по-старому — из блоков страницы «Главная»."
                                    />
                                ) : null}

                                <div className={style.rows}>
                                    {rows.map((item, index) => (
                                        <div key={item.id} className={style.row}>
                                            <span className={style.rowOrder}>{index + 1}</span>

                                            <span className={style.rowBody}>
                                                <span className={style.rowTitle}>{item.title}</span>
                                                <span className={style.rowMeta}>
                                                    {(item.catalogIds || []).map((id) => {
                                                        const option = byId.get(Number(id));
                                                        return (
                                                            <Badge key={id} tone="neutral">
                                                                {option ? `${option.pageName} · ${option.label}` : `каталог #${id}`}
                                                            </Badge>
                                                        );
                                                    })}
                                                    {item.isHidden ? <Badge tone="warning">скрыт</Badge> : null}
                                                </span>
                                            </span>

                                            <span className={style.rowTools}>
                                                <IconButton label="Выше" disabled={index === 0 || isBusy} onClick={() => reorder(item.id, -1)}>↑</IconButton>
                                                <IconButton label="Ниже" disabled={index === rows.length - 1 || isBusy} onClick={() => reorder(item.id, 1)}>↓</IconButton>
                                                <Button size="s" variant="ghost" onClick={() => toggleHidden(item)}>
                                                    {item.isHidden ? 'Показать' : 'Скрыть'}
                                                </Button>
                                                <Button size="s" variant="ghost" onClick={() => open(item)}>Править</Button>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Panel>

                    {editing ? (
                        <ShelfInspector
                            key={editing.item?.id ?? 'new'}
                            shelf={editing.item}
                            groups={groups}
                            count={rows.length}
                            onDraft={setDraft}
                            onClose={close}
                        />
                    ) : null}
                </div>

                <DesktopPreview shelves={previewShelves} banners={previewBanners}/>
            </div>
        </Workspace>
    );
}
