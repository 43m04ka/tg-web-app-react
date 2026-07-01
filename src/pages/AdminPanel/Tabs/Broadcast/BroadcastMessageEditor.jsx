import React, {useEffect, useId, useRef, useState} from 'react';
import style from './Broadcast.module.scss';
import {emptyDraft, nextId, isVideoFile} from './broadcastConstants';
import BroadcastMediaDropzone from './BroadcastMediaDropzone';
import BroadcastRichEditor from './BroadcastRichEditor';
import BroadcastInlineKeyboardEditor from './BroadcastInlineKeyboardEditor';
import BroadcastSendPanel from './BroadcastSendPanel';

const normalizeInitialMedia = (m) => {
    if (m == null) return null;
    if (Array.isArray(m)) return m[0] ?? null;
    return m;
};

/**
 * Форма рассылки: один медиафайл, HTML-текст, отправка на /broadcast/tg/send.
 */
const BroadcastMessageEditor = ({initialDraft, onDraftChange, authenticationData, limits}) => {
    const inputId = useId();
    const richEditorRef = useRef(null);
    const [draft, setDraft] = useState(() => initialDraft || emptyDraft());
    const [dragActive, setDragActive] = useState(false);
    const [editorReset, setEditorReset] = useState(() => ({
        v: 0,
        html: (initialDraft || emptyDraft()).captionHtml ?? '',
    }));

    const mediaSnapshotRef = useRef([]);
    useEffect(() => {
        mediaSnapshotRef.current = draft.media ? [draft.media] : [];
    }, [draft.media]);

    useEffect(() => {
        return () => {
            mediaSnapshotRef.current.forEach((m) => {
                if (m?.previewUrl) URL.revokeObjectURL(m.previewUrl);
            });
        };
    }, []);

    useEffect(() => {
        if (!initialDraft) return;
        const merged = {
            ...emptyDraft(),
            ...initialDraft,
            captionHtml: initialDraft.captionHtml ?? '',
            media: normalizeInitialMedia(initialDraft.media),
            keyboardRows: Array.isArray(initialDraft.keyboardRows) ? initialDraft.keyboardRows : [],
        };
        setDraft(merged);
        setEditorReset((prev) => ({v: prev.v + 1, html: merged.captionHtml}));
    }, [initialDraft]);

    const pushCaption = (html) => {
        setDraft((prev) => {
            if (prev.captionHtml === html) return prev;
            const next = {...prev, captionHtml: html};
            onDraftChange?.(next);
            return next;
        });
    };

    const addFiles = (fileList) => {
        const file = Array.from(fileList || []).filter(Boolean)[0];
        if (!file) return;
        setDraft((prev) => {
            if (prev.media?.previewUrl) URL.revokeObjectURL(prev.media.previewUrl);
            const item = {
                id: nextId(),
                file,
                previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                name: file.name,
                isVideo: isVideoFile(file),
            };
            const next = {...prev, media: item};
            onDraftChange?.(next);
            return next;
        });
    };

    const removeMedia = () => {
        setDraft((prev) => {
            if (prev.media?.previewUrl) URL.revokeObjectURL(prev.media.previewUrl);
            const next = {...prev, media: null};
            onDraftChange?.(next);
            return next;
        });
    };

    const onDropZoneClick = () => {
        document.getElementById(inputId)?.click();
    };

    const setKeyboardRows = (rows) => {
        setDraft((prev) => {
            const next = {...prev, keyboardRows: rows};
            onDraftChange?.(next);
            return next;
        });
    };

    return (
        <div className={style['formWrap']}>
            <BroadcastMediaDropzone
                inputId={inputId}
                dragActive={dragActive}
                setDragActive={setDragActive}
                onPickFiles={addFiles}
                onDropZoneClick={onDropZoneClick}
                media={draft.media}
                onRemoveMedia={removeMedia}
            />
            <BroadcastRichEditor
                ref={richEditorRef}
                resetVersion={editorReset.v}
                initialCaptionHtml={editorReset.html}
                hasMedia={!!draft.media}
                limits={limits}
                onCaptionChange={pushCaption}
            />
            <BroadcastInlineKeyboardEditor keyboardRows={draft.keyboardRows} onChange={setKeyboardRows} />
            <BroadcastSendPanel
                authenticationData={authenticationData}
                limits={limits}
                richEditorRef={richEditorRef}
                draft={draft}
            />
        </div>
    );
};

export default BroadcastMessageEditor;
export {emptyDraft, CAPTION_LIMIT, TEXT_LIMIT} from './broadcastConstants';
