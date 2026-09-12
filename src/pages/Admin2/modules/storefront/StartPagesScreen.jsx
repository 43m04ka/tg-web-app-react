import React, {useCallback, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    EmptyState,
    ErrorState,
    IconButton,
    Note,
    Panel,
    Select,
    SkeletonRows,
    Workspace
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {fetchPages, fetchPopular, fetchStartPages, updateStartItem} from './api';
import {
    START_PLATFORMS,
    byPlatform,
    moveStart,
    orphanWarning,
    startTitle,
    toGroups,
    typeTitle
} from './startModel';
import StartPageInspector from './StartPageInspector';
import StartPreview from './StartPreview';
import {byPlatform as popularOf} from './popularModel';
import style from './StorefrontScreen.module.scss';

export default function StartPagesScreen() {
    usePageHeader('Стартовый экран');

    const [platform, setPlatform] = useState('tg');
    const [editing, setEditing] = useState(null);
    const [isBusy, setBusy] = useState(false);

    const start = useResource(keys.startPages, fetchStartPages);
    const pages = useResource(keys.pages, fetchPages);
    const popular = useResource(keys.popular, fetchPopular);
    const popularRows = useMemo(
        () => popularOf(popular.data?.result, platform).filter((item) => item.product),
        [popular.data, platform]
    );

    const all = useMemo(() => start.data?.result || [], [start.data]);
    const rows = useMemo(() => byPlatform(all, platform), [all, platform]);
    const pageList = useMemo(() => pages.data?.result || [], [pages.data]);

    const groups = useMemo(() => toGroups(rows), [rows]);
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

            invalidate(keys.startPages);
        } catch (error) {
            toastFail(error.message || 'Не получилось переставить', error.hint || '');

            invalidate(keys.startPages);
        } finally {
            setBusy(false);
        }
    }, [rows, isBusy]);

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
                <Button size="s" variant="ghost" onClick={start.refresh}>Обновить</Button>
            </HeaderActions>

            <Panel
                title="Стартовый экран"
                subtitle="Первое, что видит покупатель"
                wide
                scroll
                actions={(
                    <>
                        <Select
                            options={START_PLATFORMS}
                            value={platform}
                            onChange={(event) => setPlatform(event.target.value)}
                        />
                        <Button size="s" variant="primary" onClick={() => setEditing({item: null})}>
                            Добавить
                        </Button>
                    </>
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
                                <IconButton
                                    label="Выше"
                                    disabled={index === 0 || isBusy}
                                    onClick={() => reorder(item.id, -1)}
                                >
                                    ↑
                                </IconButton>
                                <IconButton
                                    label="Ниже"
                                    disabled={index === rows.length - 1 || isBusy}
                                    onClick={() => reorder(item.id, 1)}
                                >
                                    ↓
                                </IconButton>
                                <Button size="s" variant="ghost" onClick={() => setEditing({item})}>
                                    Править
                                </Button>
                            </span>
                        </div>
                    ))}
                </div>
            </Panel>

            <aside className={style.preview}>
                <header className={style.previewHead}>
                    <span className={style.previewTitle}>Как увидит покупатель</span>
                </header>

                <div className={style.previewBody}>
                    {groups.length === 0 ? (
                        <p className={style.previewEmpty}>Пока нечего показывать</p>
                    ) : (
                        <StartPreview rows={rows} pages={pageList} popular={popularRows}/>
                    )}
                </div>
            </aside>

            {editing ? (
                <StartPageInspector
                    item={editing.item}
                    platform={platform}
                    pages={pageList}
                    count={rows.length}
                    onClose={() => setEditing(null)}
                />
            ) : null}
        </Workspace>
    );
}
