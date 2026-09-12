import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Badge,
    Button,
    Collection,
    DocTabs,
    Field,
    Input,
    Modal,
    Mono,
    Note,
    Select,
    TabPane,
    TabbedScreen,
    useCollectionState,
    useWorkspaceTabs
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {toast, toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {createCatalog, fetchCatalogs, fetchPages, fetchQueue} from './api';
import {catalogProblem, pageTitleOf, saleState, sortCatalogs, sourceOfPage} from './catalogsModel';
import CatalogInspector from './CatalogInspector';
import style from './CatalogsScreen.module.scss';

const DEFAULTS = {search: '', page: ''};

const BLANK = {path: '', structurePageId: ''};

export default function CatalogsScreen() {
    usePageHeader('Каталоги');

    const navigate = useNavigate();
    const {id} = useParams();
    const {value, patch, withQuery} = useCollectionState(DEFAULTS);

    const [isCreating, setCreating] = useState(false);
    const [draft, setDraft] = useState(BLANK);
    const [busy, setBusy] = useState(false);

    const catalogs = useResource(keys.catalogList, fetchCatalogs);
    const pages = useResource(keys.pages, fetchPages);
    const queue = useResource(keys.parseQueue, fetchQueue, {refreshMs: 10000});

    const pageList = useMemo(() => pages.data?.result || [], [pages.data]);
    const all = useMemo(() => sortCatalogs(catalogs.data?.result, pageList), [catalogs.data, pageList]);

    const rows = useMemo(() => {
        const needle = value.search.trim().toLowerCase();

        return all
            .filter((item) => (!needle || String(item.path).toLowerCase().includes(needle)))
            .filter((item) => (!value.page || String(item.structurePageId) === value.page));
    }, [all, value]);

    const pageOptions = useMemo(() => ([
        {value: '', title: 'Витрина: любая'},
        ...pageList.map((page) => ({value: String(page.id), title: page.name || `Витрина №${page.id}`}))
    ]), [pageList]);

    const columns = useMemo(() => ([
        {
            id: 'path',
            title: 'Путь',
            width: 240,
            cell: (row) => <Mono>{row.path}</Mono>
        },
        {
            id: 'page',
            title: 'Витрина',
            cell: (row) => pageTitleOf(row, pageList) || <span className={style.dash}>не привязан</span>
        },
        {
            id: 'source',
            title: 'Источник',
            width: 140,
            cell: (row) => sourceOfPage(row, pageList) || <span className={style.dash}>—</span>
        },
        {
            id: 'sale',
            title: 'Продажи',
            width: 150,
            cell: (row) => {
                const state = saleState(row);
                return <Badge tone={state.tone}>{state.title}</Badge>;
            }
        },
        {
            id: 'india',
            title: 'Курс Индии',
            width: 120,
            cell: (row) => (row.isExchangeIndiaCatalog
                ? <Badge tone="accent">источник</Badge>
                : <span className={style.dash}>—</span>)
        }
    ]), [pageList]);

    const activeId = id ? String(id) : null;

    const go = useCallback(
        (tabId) => navigate(withQuery(tabId ? `/admin2/catalogs/${tabId}` : '/admin2/catalogs')),
        [navigate, withQuery]
    );

    const workspace = useWorkspaceTabs({
        storageKey: 'a2.tabs.catalogs',
        activeId,
        go,
        fallbackTitle: (tabId) => `Каталог #${tabId}`,
    });

    const openCatalog = useCallback((row) => {
        workspace.open({id: String(row.id), title: row.path});
        go(String(row.id));
    }, [workspace, go]);

    const byId = useMemo(() => new Map(all.map((item) => [String(item.id), item])), [all]);

    const shownTabs = useMemo(() => workspace.tabs.map((tab) => {
        const catalog = byId.get(tab.id);
        return catalog
            ? {...tab, title: catalog.path, caption: pageTitleOf(catalog, pageList) || 'витрина не найдена'}
            : tab;
    }), [workspace.tabs, byId, pageList]);

    const {drop} = workspace;

    useEffect(() => {
        if (!catalogs.data || all.length === 0) return;

        const gone = workspace.tabs.filter((tab) => !byId.has(tab.id)).map((tab) => tab.id);
        if (gone.length) drop(gone);
        if (activeId && !byId.has(activeId)) go(null);
    }, [catalogs.data, all, byId, workspace.tabs, drop, activeId, go]);

    const problem = catalogProblem(draft, {existing: all});

    const submitNew = useCallback(async () => {
        if (problem || busy) return;

        setBusy(true);

        try {
            await createCatalog({
                path: draft.path.trim(),
                structurePageId: Number(draft.structurePageId)
            });

            invalidate(keys.catalogList);
            setCreating(false);
            setDraft(BLANK);
            toast({tone: 'positive', title: 'Каталог заведён', text: 'Наполните его парсом или импортом'});
        } catch (error) {
            toastFail(error.message || 'Не получилось завести каталог', error.hint || '');
        } finally {
            setBusy(false);
        }
    }, [problem, busy, draft]);

    return (
        <TabbedScreen
            strip={(
                <DocTabs
                    listTitle="Все каталоги"
                    listCount={all.length || null}
                    tabs={shownTabs}
                    active={activeId}
                    onSelect={go}
                    onClose={(tabId) => workspace.close(tabId)}
                    onMove={workspace.move}
                />
            )}
        >
            <TabPane active={!activeId}>
            <Collection
                columns={columns}
                rows={rows}
                loading={catalogs.isLoading}
                stale={catalogs.isStale}
                error={catalogs.error}
                onRetry={catalogs.refresh}
                activeKey={null}
                onOpen={openCatalog}
                search={{
                    value: value.search,
                    onChange: (next) => patch({search: next}),
                    placeholder: 'Путь каталога'
                }}
                filters={(
                    <Select
                        options={pageOptions}
                        value={value.page}
                        onChange={(event) => patch({page: event.target.value})}
                    />
                )}
                actions={(
                    <>
                        <Button size="s" variant="primary" onClick={() => setCreating(true)}>Новый каталог</Button>
                        <Button size="s" variant="ghost" onClick={catalogs.refresh}>Обновить</Button>
                    </>
                )}
                empty={{
                    title: value.search ? 'Такого каталога нет' : 'Каталогов нет',
                    text: 'Каталог — это то, куда парсер складывает товары, и то, на что ссылается блок витрины.'
                }}
            />
            </TabPane>

            {workspace.tabs.map((tab) => {
                const catalog = byId.get(tab.id);
                if (!catalog) return null;

                return (
                    <CatalogInspector
                        key={tab.id}
                        catalog={catalog}
                        pages={pageList}
                        queue={queue.data}
                        active={tab.id === activeId}
                        onClose={() => workspace.close(tab.id)}
                        onRemoved={() => invalidate(keys.catalogList)}
                    />
                );
            })}

            {isCreating ? (
                <Modal
                    title="Новый каталог"
                    onClose={() => setCreating(false)}
                    footer={(
                        <>
                            <Button variant="primary" disabled={busy || Boolean(problem)} onClick={submitNew}>
                                {busy ? 'Заводим…' : 'Завести'}
                            </Button>
                            <Button variant="ghost" onClick={() => setCreating(false)}>Отмена</Button>
                        </>
                    )}
                >
                    <Field
                        label="Путь"
                        hint="По нему на каталог ссылается блок витрины. Менять потом нельзя — ссылки перестанут работать."
                        required
                    >
                        <Input
                            mono
                            value={draft.path}
                            placeholder="ps_tur_games"
                            onChange={(event) => setDraft((prev) => ({...prev, path: event.target.value}))}
                        />
                    </Field>

                    <Field label="Витрина" hint="Определяет парсер и сетку наценки" required>
                        <Select
                            options={[{value: '', title: 'Не выбрана'}, ...pageOptions.slice(1)]}
                            value={draft.structurePageId}
                            onChange={(event) => setDraft((prev) => ({...prev, structurePageId: event.target.value}))}
                        />
                    </Field>

                    {problem ? <Note tone="danger">{problem}</Note> : null}
                </Modal>
            ) : null}
        </TabbedScreen>
    );
}
