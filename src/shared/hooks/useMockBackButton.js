import { useState, useEffect } from 'react';
import { getTelegramObject, subscribeMockBackButton } from '../lib/telegram';

const readIsVisible = () => getTelegramObject().BackButton?.isVisible || false;

export function useMockBackButton() {
    const [isVisible, setIsVisible] = useState(readIsVisible);

    useEffect(() => {
        const updater = () => setIsVisible(readIsVisible());
        updater();
        return subscribeMockBackButton(updater);
    }, []);

    return isVisible;
}
