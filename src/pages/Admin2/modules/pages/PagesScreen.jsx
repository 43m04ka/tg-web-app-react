import React, {useCallback, useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Badge, Button, Collection, Mono, Tabs, Workspace, useCollectionState} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {fetchTextPages} from './api';
import PageEditor from './PageEditor';
import {SECTIONS, TAG_OPTIONS, sectionOf} from './pagesModel';
import style from './PagesScreen.module.scss';

const DEFAULTS = {search: '', section: 'page'};

const dayTitle = (value) => (value ? new Date(value).toLocaleDateString('ru-RU') : '');

const tagTitle = (tag) => TAG_OPTIONS.find((option) => option.value === tag && tag)?.title || '';

export default function PagesScreen() {
    usePageHeader('Текстовые страницы');

    const navigate = useNavigate();
    const {id} = useParams();
    const {value, patch, withQuery} = useCollectionState(DEFAULTS);

    const section = sectionOf(value.section).id;
    const list = useResource(keys.textPageList(section), () => fetchTextPages(section));

    const all = useMemo(() => list.data?.result || [], [list.data]);

    const rows = useMemo(() => {
        const needle = value.search.trim().toLowerCase();
        if (!needle) return all;

        return all.filter((page) => `${page.title} ${page.slug}`.toLowerCase().includes(needle));
    }, [all, value.search]);

    const columns = useMemo(() => [
        {
            id: 'title',
            title: 'Заголовок',
            cell: (row) => <span className={style.name}>{row.title}</span>
        },
        {
            id: 'slug',
            title: 'Адрес',
            width: 260,
            cell: (row) => <Mono>{`${sectionOf(row.section).route}/${row.slug}`}</Mono>
        },
        section === 'page'
            ? {
                id: 'places',
                title: 'Ссылки',
                width: 150,
                cell: (row) => (
                    <span className={style.badges}>
                        {row.showInFooter ? <Badge tone="info">подвал</Badge> : null}
                        {row.showInMenu ? <Badge tone="info">меню</Badge> : null}
                    </span>
                )
            }
            : {
                id: 'tag',
                title: 'Метка',
                width: 120,
                cell: (row) => tagTitle(row.tag)
            },
        section === 'news'
            ? {
                id: 'date',
                title: 'Дата',
                width: 150,
                cell: (row) => dayTitle(row.publishedAt)
            }
            : null,
        {
            id: 'state',
            title: 'Статус',
            width: 110,
            cell: (row) => (row.isPublished
                ? <Badge tone="positive">на сайте</Badge>
                : <Badge tone="warning">скрыта</Badge>)
        }
    ].filter(Boolean), [section]);

    const open = useCallback((row) => navigate(withQuery(`/admin2/pages/${row.id}`)), [navigate, withQuery]);
    const close = useCallback(() => navigate(withQuery('/admin2/pages')), [navigate, withQuery]);
    const startNew = useCallback(() => navigate(withQuery('/admin2/pages/new')), [navigate, withQuery]);

    const onSaved = useCallback((page, wasNew) => {
        if (wasNew && page?.id) navigate(withQuery(`/admin2/pages/${page.id}`), {replace: true});
    }, [navigate, withQuery]);

    if (id) {
        return (
            <Workspace>
                <PageEditor
                    key={id}
                    id={id === 'new' ? 'new' : Number(id)}
                    section={section}
                    onClose={close}
                    onSaved={onSaved}
                />
            </Workspace>
        );
    }

    return (
        <Workspace>
            <Collection
                columns={columns}
                rows={rows}
                loading={list.isLoading}
                stale={list.isStale}
                error={list.error}
                onRetry={list.refresh}
                onOpen={open}
                openLabel="Редактировать"
                search={{
                    value: value.search,
                    onChange: (next) => patch({search: next}),
                    placeholder: 'Заголовок или адрес'
                }}
                filters={(
                    <Tabs
                        items={SECTIONS.map((item) => ({id: item.id, title: item.title}))}
                        value={section}
                        onChange={(next) => patch({section: next, search: ''})}
                    />
                )}
                actions={(
                    <>
                        <Button size="s" variant="primary" onClick={startNew}>
                            {`Создать: ${sectionOf(section).one.toLowerCase()}`}
                        </Button>
                        <Button size="s" variant="ghost" onClick={list.refresh}>Обновить</Button>
                    </>
                )}
                footNote={rows.length ? `Всего: ${rows.length}` : ''}
                empty={{
                    title: value.search ? 'Ничего не нашлось' : 'Здесь пока пусто',
                    text: value.search
                        ? 'Проверьте написание или сбросьте поиск.'
                        : 'Создайте первую страницу — она появится на сайте сразу после сохранения.'
                }}
            />
        </Workspace>
    );
}
