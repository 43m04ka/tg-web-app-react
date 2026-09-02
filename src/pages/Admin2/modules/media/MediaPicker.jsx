import React, {useCallback, useState} from 'react';
import {Button, ButtonRow, Modal} from '../../ui';
import MediaBrowser from './MediaBrowser';

export function MediaPicker({value = '', onPick, onClose}) {
    const [chosen, setChosen] = useState(null);

    const confirm = useCallback(() => {
        if (!chosen) return;

        onPick(chosen.url, chosen);
        onClose();
    }, [chosen, onPick, onClose]);

    return (
        <Modal
            size="l"
            title="Медиатека"
            subtitle="Выберите картинку или загрузите новую"
            onClose={onClose}
            footer={(
                <ButtonRow align="end">
                    <Button variant="ghost" onClick={onClose}>Отмена</Button>
                    <Button variant="primary" disabled={!chosen} onClick={confirm}>Вставить</Button>
                </ButtonRow>
            )}
        >
            <MediaBrowser compact selected={chosen?.url || value} onPick={setChosen}/>
        </Modal>
    );
}

export function useMediaPicker() {
    const [open, setOpen] = useState(false);

    return {
        open,
        show: useCallback(() => setOpen(true), []),
        hide: useCallback(() => setOpen(false), []),
    };
}
