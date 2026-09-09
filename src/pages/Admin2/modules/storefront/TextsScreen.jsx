import React, {useCallback, useMemo, useState} from 'react';
import {
    Button,
    EmptyState,
    ErrorState,
    IconButton,
    Input,
    Note,
    Panel,
    SkeletonRows,
    Textarea,
    Workspace
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {
    createClue,
    createInfoBlock,
    deleteClue,
    deleteInfoBlock,
    fetchClues,
    fetchInfoBlocks,
    updateInfoBlock
} from './api';
import StorefrontTabs from './StorefrontTabs';
import style from './StorefrontScreen.module.scss';

const BLANK_BLOCK = {name: '', body: '', path: ''};

export default function TextsScreen() {
    usePageHeader('Витрина');

    const blocks = useResource(keys.infoBlocks, fetchInfoBlocks);
    const clues = useResource(keys.searchClues, fetchClues);

    const [draft, setDraft] = useState(BLANK_BLOCK);
    const [editingId, setEditingId] = useState(null);
    const [clue, setClue] = useState('');
    const [isBusy, setBusy] = useState(false);

    const blockList = useMemo(() => blocks.data?.result || [], [blocks.data]);
    const clueList = useMemo(
        () => (clues.data?.result || []).slice().sort((left, right) =>
            String(left.name || '').localeCompare(String(right.name || ''), 'ru')),
        [clues.data]
    );

    const reset = useCallback(() => {
        setDraft(BLANK_BLOCK);
        setEditingId(null);
    }, []);

    const saveBlock = useCallback(async () => {
        if (!draft.name.trim() || !draft.body.trim() || isBusy) return;

        setBusy(true);

        try {
            const payload = {
                name: draft.name.trim(),
                body: draft.body.trim(),
                path: draft.path.trim()
            };

            if (editingId) await updateInfoBlock(editingId, payload);
            else await createInfoBlock(payload);

            invalidate(keys.infoBlocks);
            reset();
            toast({tone: 'positive', title: editingId ? 'Блок сохранён' : 'Блок добавлен'});
        } catch (error) {
            toastFail(error.message || 'Не получилось сохранить', error.hint || '');
        } finally {
            setBusy(false);
        }
    }, [draft, editingId, isBusy, reset]);

    const removeBlock = useCallback(async (item) => {
        const answer = await askConfirm({
            title: `Удалить блок «${item.name}»?`,
            text: 'Он пропадёт там, где сейчас показывается покупателю.',
            confirmText: 'Удалить',
            tone: 'danger'
        });

        if (!answer) return;

        try {
            await deleteInfoBlock(item.id);
            invalidate(keys.infoBlocks);
            if (editingId === item.id) reset();
        } catch (error) {
            toastFail(error.message || 'Не получилось удалить', error.hint || '');
        }
    }, [editingId, reset]);

    const addClue = useCallback(async () => {
        const name = clue.trim();
        if (!name || isBusy) return;

        if (clueList.some((item) => String(item.name).toLowerCase() === name.toLowerCase())) {
            toastFail('Такая подсказка уже есть', '');
            return;
        }

        setBusy(true);

        try {
            await createClue({name});
            invalidate(keys.searchClues);
            setClue('');
        } catch (error) {
            toastFail(error.message || 'Не получилось добавить', error.hint || '');
        } finally {
            setBusy(false);
        }
    }, [clue, clueList, isBusy]);

    const removeClue = useCallback(async (item) => {
        try {
            await deleteClue(item.id);
            invalidate(keys.searchClues);
        } catch (error) {
            toastFail(error.message || 'Не получилось удалить', error.hint || '');
        }
    }, []);

    return (
        <Workspace>
            <HeaderActions>
                <StorefrontTabs/>
                <Button size="s" variant="ghost" onClick={blocks.refresh}>Обновить</Button>
            </HeaderActions>

            <Panel title="Инфоблоки" subtitle="Тексты для витрины" wide scroll>
                <Note tone="neutral">
                    Блок находят по имени: витрина запрашивает его и рисует тело там, где нужно.
                    Путь — необязательная подсказка, где блок используется.
                </Note>

                <div className={style.textForm}>
                    <Input
                        value={draft.name}
                        placeholder="Название, например delivery-note"
                        onChange={(event) => setDraft((prev) => ({...prev, name: event.target.value}))}
                    />

                    <Textarea
                        rows={4}
                        value={draft.body}
                        placeholder="Текст блока"
                        onChange={(event) => setDraft((prev) => ({...prev, body: event.target.value}))}
                    />

                    <Input
                        value={draft.path}
                        placeholder="Где показывается, необязательно"
                        onChange={(event) => setDraft((prev) => ({...prev, path: event.target.value}))}
                    />

                    <div className={style.textFormFoot}>
                        <Button
                            size="s"
                            variant="primary"
                            disabled={isBusy || !draft.name.trim() || !draft.body.trim()}
                            onClick={saveBlock}
                        >
                            {editingId ? 'Сохранить' : 'Добавить'}
                        </Button>

                        {editingId ? (
                            <Button size="s" variant="ghost" onClick={reset}>Отмена</Button>
                        ) : null}
                    </div>
                </div>

                {blocks.error ? <ErrorState error={blocks.error} onRetry={blocks.refresh}/> : null}
                {blocks.isLoading && !blocks.data ? <SkeletonRows count={3}/> : null}

                {blocks.data && blockList.length === 0 ? (
                    <EmptyState title="Инфоблоков нет" text="Заведите первый — витрина найдёт его по имени."/>
                ) : null}

                <div className={style.blocks}>
                    {blockList.map((item) => (
                        <div key={item.id} className={style.block}>
                            <span className={style.blockBody}>
                                <span className={style.blockTitle}>{item.name}</span>
                                <span className={style.blockNote}>{item.body}</span>
                            </span>

                            <span className={style.blockTools}>
                                <Button
                                    size="s"
                                    variant="ghost"
                                    onClick={() => {
                                        setDraft({
                                            name: item.name || '',
                                            body: item.body || '',
                                            path: item.path || ''
                                        });
                                        setEditingId(item.id);
                                    }}
                                >
                                    Править
                                </Button>
                                <IconButton label="Удалить" onClick={() => removeBlock(item)}>×</IconButton>
                            </span>
                        </div>
                    ))}
                </div>
            </Panel>

            <Panel title="Подсказки поиска" scroll>
                <Note tone="neutral">
                    Слова, по которым поиск чинит опечатку покупателя. Правки у подсказки нет —
                    неверную проще удалить и завести заново.
                </Note>

                <div className={style.textForm}>
                    <Input
                        value={clue}
                        placeholder="Например, киберпанк"
                        onChange={(event) => setClue(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') addClue();
                        }}
                    />

                    <div className={style.textFormFoot}>
                        <Button size="s" variant="primary" disabled={isBusy || !clue.trim()} onClick={addClue}>
                            Добавить
                        </Button>
                    </div>
                </div>

                {clues.error ? <ErrorState error={clues.error} onRetry={clues.refresh}/> : null}
                {clues.isLoading && !clues.data ? <SkeletonRows count={4}/> : null}

                {clues.data && clueList.length === 0 ? (
                    <EmptyState title="Подсказок нет" text="Поиск будет чинить опечатки только по названиям товаров."/>
                ) : null}

                <div className={style.clues}>
                    {clueList.map((item) => (
                        <span key={item.id} className={style.clue}>
                            {item.name}
                            <button
                                type="button"
                                className={style.clueDrop}
                                aria-label={`Удалить ${item.name}`}
                                onClick={() => removeClue(item)}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </Panel>
        </Workspace>
    );
}
