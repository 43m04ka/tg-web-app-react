import {useCallback, useEffect, useState} from 'react';

const readCommands = () => {
    try {
        return {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough'),
        };
    } catch {
        return {bold: false, italic: false, underline: false, strikeThrough: false};
    }
};

const selectionInside = (editorEl) => {
    if (!editorEl) return false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const node = sel.anchorNode;
    if (node === editorEl) return true;
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    return el ? editorEl.contains(el) : false;
};

/**
 * Состояние активных стилей для панели форматирования (contentEditable).
 */
export const useFormatBarState = (editorRef) => {
    const [fmt, setFmt] = useState(readCommands);

    const refresh = useCallback(() => {
        const root = editorRef.current;
        if (!root || !selectionInside(root)) return;
        setFmt(readCommands());
    }, [editorRef]);

    useEffect(() => {
        const onSel = () => refresh();
        document.addEventListener('selectionchange', onSel);
        return () => document.removeEventListener('selectionchange', onSel);
    }, [refresh]);

    return [fmt, refresh];
};
