import React, {useEffect, useState} from 'react';
import {subscribeConfirm} from '../platform/notify';
import {Modal} from './primitives/Modal';
import {Button} from './primitives/Button';
import {Note} from './primitives/Feedback';
import style from './ConfirmHost.module.scss';

export default function ConfirmHost() {
    const [request, setRequest] = useState(null);

    useEffect(() => subscribeConfirm(setRequest), []);

    if (!request) return null;

    return (
        <Modal
            size="s"
            title={request.title}
            onClose={() => request.settle(false)}
            footer={(
                <>
                    <Button variant="ghost" onClick={() => request.settle(false)}>Отмена</Button>
                    <Button
                        variant={request.tone === 'danger' ? 'danger' : 'primary'}
                        onClick={() => request.settle(true)}
                    >
                        {request.confirmText}
                    </Button>
                </>
            )}
        >
            {request.text ? <p className={style.text}>{request.text}</p> : null}
            {request.consequence ? (
                <Note tone={request.tone === 'danger' ? 'danger' : 'neutral'}>{request.consequence}</Note>
            ) : null}
        </Modal>
    );
}
