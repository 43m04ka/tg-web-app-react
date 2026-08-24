import {useEffect, useRef} from 'react';
import {getWebApp} from '../lib/telegram';

export function useBackButton(onBack) {
    const handlerRef = useRef(onBack);
    handlerRef.current = onBack;

    useEffect(() => {
        const tg = getWebApp();
        if (!tg?.BackButton) return undefined;

        const handle = () => handlerRef.current?.();

        tg.BackButton.show();
        tg.onEvent('backButtonClicked', handle);

        return () => {
            tg.offEvent('backButtonClicked', handle);
            tg.BackButton.hide();
        };
    }, []);
}
