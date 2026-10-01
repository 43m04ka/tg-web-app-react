import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    Field,
    Grid,
    Input,
    Inspector,
    InspectorSection,
    Note,
    Select,
    Textarea,
    Toggle
} from '../../ui';
import {askConfirm} from '../../platform/notify';
import {keys} from '../../platform/resources';
import {useMutation} from '../../platform/useMutation';
import {useResource} from '../../platform/useResource';
import {MediaPicker, useMediaPicker} from '../media/MediaPicker';
import {deleteTextPage, fetchTextPage, saveTextPage} from './api';
import BlockEditor from './BlockEditor';
import PagePreview from './PagePreview';
import {
    BLOCK_KINDS,
    SECTION_OPTIONS,
    TAG_OPTIONS,
    insertAt,
    isDirty,
    moveItem,
    newBlock,
    publicRoute,
    sectionOf,
    toDraft,
    toPayload,
    validate
} from './pagesModel';
import style from './PagesScreen.module.scss';

const TABS = [
    {id: 'content', title: 'Содержимое'},
    {id: 'settings', title: 'Настройки'}
];

function KindPicker({onPick, onCancel}) {
    return (
        <div className={style.kinds}>
            {BLOCK_KINDS.map((kind) => (
                <button key={kind.type} type="button" className={style.kind} onClick={() => onPick(kind.type)}>
                    {kind.title}
                </button>
            ))}

            {onCancel ? <button type="button" className={style.kindCancel} onClick={onCancel}>Отмена</button> : null}
        </div>
    );
}

export default function PageEditor({id, section, onClose, onSaved}) {
    const isNew = id === 'new';
    const picker = useMediaPicker();

    const card = useResource(keys.textPage(isNew ? 0 : id), () => fetchTextPage(id), {enabled: !isNew});
    const page = isNew ? null : card.data?.result || null;

    const [base, setBase] = useState(() => toDraft(null, section));
    const [draft, setDraft] = useState(base);
    const [tab, setTab] = useState('content');
    const [touched, setTouched] = useState(false);
    const [collapsed, setCollapsed] = useState(() => new Set());
    const [insertAfter, setInsertAfter] = useState(null);

    useEffect(() => {
        if (isNew || !page) return;

        const next = toDraft(page);
        setBase(next);
        setDraft(next);
        setCollapsed(new Set());
        setInsertAfter(null);
    }, [isNew, page]);

    const errors = useMemo(() => validate(draft), [draft]);
    const hasErrors = Object.keys(errors).length > 0;
    const dirty = isNew ? Boolean(draft.title.trim() || draft.blocks.length) : isDirty(draft, base);

    const set = useCallback((field, value) => setDraft((current) => ({...current, [field]: value})), []);

    const setBlocks = useCallback(
        (update) => setDraft((current) => ({...current, blocks: update(current.blocks)})),
        []
    );

    const save = useMutation(saveTextPage, {
        invalidates: [keys.textPages],
        done: isNew ? 'Страница создана' : 'Страница сохранена',
        onDone: (result) => onSaved(result?.result || null, isNew)
    });

    const remove = useMutation(() => deleteTextPage(id), {
        invalidates: [keys.textPages],
        done: 'Страница удалена',
        onDone: onClose
    });

    const submit = useCallback(() => {
        setTouched(true);

        if (hasErrors) {
            setTab('settings');
            return;
        }

        save.run({id: isNew ? null : id, data: toPayload(draft)});
    }, [hasErrors, save, isNew, id, draft]);

    const askRemove = useCallback(async () => {
        const answer = await askConfirm({
            title: `Удалить «${base.title}»?`,
            text: 'Страница пропадёт с сайта, ссылки на неё перестанут работать.',
            consequence: 'Восстановить не получится.',
            confirmText: 'Удалить',
            tone: 'danger'
        });

        if (answer) remove.run();
    }, [base.title, remove]);

    const addBlock = useCallback((type, index) => {
        setBlocks((blocks) => insertAt(blocks, index, newBlock(type)));
        setInsertAfter(null);
    }, [setBlocks]);

    const toggleBlock = useCallback((uid) => setCollapsed((current) => {
        const next = new Set(current);

        if (next.has(uid)) next.delete(uid);
        else next.add(uid);

        return next;
    }), []);

    const allCollapsed = draft.blocks.length > 0 && draft.blocks.every((block) => collapsed.has(block.uid));

    const toggleAll = useCallback(() => {
        setCollapsed(allCollapsed ? new Set() : new Set(draft.blocks.map((block) => block.uid)));
    }, [allCollapsed, draft.blocks]);

    const showError = (field) => (touched ? errors[field] || '' : '');
    const current = sectionOf(draft.section);
    const canOpen = !isNew && page?.isPublished;

    return (
        <Inspector
            open
            width="full"
            title={isNew ? `Новая: ${current.one.toLowerCase()}` : base.title || 'Страница'}
            subtitle={isNew ? 'Появится на сайте после сохранения' : publicRoute(base)}
            badge={isNew ? null : (base.isPublished
                ? <Badge tone="positive">на сайте</Badge>
                : <Badge tone="warning">скрыта</Badge>)}
            tabs={TABS}
            tab={tab}
            onTab={setTab}
            onClose={onClose}
            dirty={dirty}
            loading={!isNew && card.isLoading}
            error={isNew ? null : card.error}
            onRetry={card.refresh}
            footer={(
                <>
                    <Button variant="primary" onClick={submit} disabled={!dirty} loading={save.loading}>
                        Сохранить
                    </Button>

                    {isNew ? null : (
                        <Button variant="ghost" onClick={() => setDraft(base)} disabled={!dirty}>
                            Отменить правки
                        </Button>
                    )}

                    {canOpen ? (
                        <a className={style.open} href={publicRoute(page)} target="_blank" rel="noreferrer">
                            Открыть на сайте
                        </a>
                    ) : null}

                    <span className={style.spacer}/>

                    {isNew ? null : (
                        <Button variant="danger" onClick={askRemove} loading={remove.loading}>Удалить</Button>
                    )}
                </>
            )}
        >
            {tab === 'content' ? (
                <div className={style.split}>
                    <div className={style.splitMain}>
                        <InspectorSection title="Заголовок">
                            <Field error={showError('title')}>
                                <Input
                                    value={draft.title}
                                    invalid={Boolean(showError('title'))}
                                    placeholder="Заголовок страницы"
                                    onChange={(event) => set('title', event.target.value)}
                                />
                            </Field>
                        </InspectorSection>

                        <InspectorSection
                            title={`Блоки · ${draft.blocks.length}`}
                            note="Страница собирается из блоков сверху вниз. Блок можно свернуть, поднять, опустить или вставить новый под ним."
                            actions={draft.blocks.length > 1 ? (
                                <Button size="s" variant="ghost" onClick={toggleAll}>
                                    {allCollapsed ? 'Развернуть все' : 'Свернуть все'}
                                </Button>
                            ) : null}
                        >
                            <div className={style.blocks}>
                                {draft.blocks.map((block, index) => (
                                    <React.Fragment key={block.uid}>
                                        <BlockEditor
                                            block={block}
                                            index={index}
                                            total={draft.blocks.length}
                                            collapsed={collapsed.has(block.uid)}
                                            onToggle={() => toggleBlock(block.uid)}
                                            onChange={(patch) => setBlocks((blocks) => blocks.map((item) => (
                                                item.uid === block.uid ? {...item, ...patch} : item
                                            )))}
                                            onMove={(shift) => setBlocks((blocks) => moveItem(blocks, index, shift))}
                                            onRemove={() => setBlocks((blocks) => blocks.filter((item) => item.uid !== block.uid))}
                                            onInsert={() => setInsertAfter(insertAfter === block.uid ? null : block.uid)}
                                        />

                                        {insertAfter === block.uid ? (
                                            <KindPicker
                                                onPick={(type) => addBlock(type, index + 1)}
                                                onCancel={() => setInsertAfter(null)}
                                            />
                                        ) : null}
                                    </React.Fragment>
                                ))}

                                <div className={style.append}>
                                    <span className={style.appendTitle}>Добавить блок в конец</span>
                                    <KindPicker onPick={(type) => addBlock(type, draft.blocks.length)}/>
                                </div>
                            </div>
                        </InspectorSection>
                    </div>

                    <PagePreview draft={draft} updatedAt={page?.updatedAt}/>
                </div>
            ) : (
                <>
                    <InspectorSection title="Адрес и раздел">
                        <Grid columns={3}>
                            <Field label="Раздел">
                                <Select
                                    options={SECTION_OPTIONS}
                                    value={draft.section}
                                    onChange={(event) => set('section', event.target.value)}
                                />
                            </Field>

                            <Field
                                label="Адрес"
                                hint={`${current.route}/${draft.slug || '…'} · пусто — соберём из заголовка`}
                                error={showError('slug')}
                            >
                                <Input
                                    mono
                                    value={draft.slug}
                                    invalid={Boolean(showError('slug'))}
                                    placeholder="payment"
                                    onChange={(event) => set('slug', event.target.value)}
                                />
                            </Field>

                            {draft.section === 'page' ? (
                                <Field label="Порядок" hint="Меньше — выше в списке">
                                    <Input
                                        type="number"
                                        value={draft.serialNumber}
                                        onChange={(event) => set('serialNumber', event.target.value)}
                                    />
                                </Field>
                            ) : (
                                <Field label="Метка" hint="По ней работает фильтр на сайте">
                                    <Select
                                        options={TAG_OPTIONS}
                                        value={draft.tag}
                                        onChange={(event) => set('tag', event.target.value)}
                                    />
                                </Field>
                            )}
                        </Grid>
                    </InspectorSection>

                    <InspectorSection title="Где показывать">
                        <div className={style.toggles}>
                            <Toggle
                                checked={draft.isPublished}
                                label="Опубликована на сайте"
                                onChange={(value) => set('isPublished', value)}
                            />

                            {draft.section === 'page' ? (
                                <>
                                    <Toggle
                                        checked={draft.showInFooter}
                                        label="Ссылка в подвале, нижняя строка"
                                        onChange={(value) => set('showInFooter', value)}
                                    />
                                    <Toggle
                                        checked={draft.showInMenu}
                                        label="Ссылка в меню верхней панели, раздел «Покупателям»"
                                        onChange={(value) => set('showInMenu', value)}
                                    />
                                </>
                            ) : null}
                        </div>

                        {draft.section === 'news' ? null : (
                            <Field label="Редакция от" hint="Дата в шапке страницы. Пусто — дата последнего сохранения">
                                <Input
                                    type="date"
                                    value={String(draft.publishedAt || '').slice(0, 10)}
                                    onChange={(event) => set('publishedAt', event.target.value ? `${event.target.value}T12:00` : '')}
                                />
                            </Field>
                        )}

                        {draft.section === 'page' ? null : (
                            <Note tone="neutral">
                                {draft.section === 'news'
                                    ? 'Новость попадает в раздел «Новости», вход в него — из меню верхней панели и подвала.'
                                    : 'Инструкция попадает в раздел «Инструкции», вход в него — из меню, подвала и раздела «Ещё».'}
                            </Note>
                        )}
                    </InspectorSection>

                    {draft.section === 'page' ? null : (
                        <InspectorSection title="Карточка в списке">
                            <Grid columns={2}>
                                {draft.section === 'news' ? (
                                    <Field label="Дата публикации" hint="Пусто — поставим текущую при сохранении">
                                        <Input
                                            type="datetime-local"
                                            value={draft.publishedAt}
                                            onChange={(event) => set('publishedAt', event.target.value)}
                                        />
                                    </Field>
                                ) : (
                                    <Field label="Порядок" hint="Меньше — выше в списке">
                                        <Input
                                            type="number"
                                            value={draft.serialNumber}
                                            onChange={(event) => set('serialNumber', event.target.value)}
                                        />
                                    </Field>
                                )}

                                <Field label="Обложка">
                                    <div className={style.imageField}>
                                        {draft.cover
                                            ? <img className={style.thumb} src={draft.cover} alt=""/>
                                            : <span className={style.thumb}/>}
                                        <Input
                                            value={draft.cover}
                                            placeholder="https://… адрес картинки"
                                            onChange={(event) => set('cover', event.target.value)}
                                        />
                                        <Button size="s" onClick={picker.show}>Выбрать</Button>
                                    </div>
                                </Field>
                            </Grid>

                            <Field label="Краткое описание" hint={draft.section === 'news' ? 'Показывается в карточке новости под заголовком' : ''}>
                                <Textarea
                                    rows={2}
                                    value={draft.excerpt}
                                    onChange={(event) => set('excerpt', event.target.value)}
                                />
                            </Field>
                        </InspectorSection>
                    )}

                    {picker.open ? (
                        <MediaPicker value={draft.cover} onPick={(url) => set('cover', url)} onClose={picker.hide}/>
                    ) : null}
                </>
            )}
        </Inspector>
    );
}
