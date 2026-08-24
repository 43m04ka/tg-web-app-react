import {useEffect, useRef} from 'react';
import {getWebApp} from '../lib/telegram';
import {useTelegramSdk} from './useTelegramSdk';

export function useBackButton(onBack) {
    const handlerRef = useRef(onBack);
    handlerRef.current = onBack;

    const sdkToken = useTelegramSdk();
    const tg = sdkToken > 0 ? getWebApp() : null;
    const isNative = Boolean(tg?.BackButton);

    useEffect(() => {
        if (!isNative) return undefined;

        const webApp = getWebApp();
        const handle = () => handlerRef.current?.();

        webApp.BackButton.show();
        webApp.onEvent('backButtonClicked', handle);

        return () => {
            webApp.offEvent('backButtonClicked', handle);
            webApp.BackButton.hide();
        };
    }, [isNative]);

    return isNative;
}
