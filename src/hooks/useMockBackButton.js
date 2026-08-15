import { useState, useEffect } from 'react';
import { getTelegramObject, subscribeMockBackButton } from './utils/isTg';

const readIsVisible = () => getTelegramObject().BackButton?.isVisible || false;

export function useMockBackButton() {
    const [isVisible, setIsVisible] = useState(readIsVisible);

    useEffect(() => {
        // Раньше состояние опрашивалось через setInterval(300ms) — теперь мок сам
        // уведомляет подписчиков в момент вызова BackButton.show()/hide()
        const updater = () => setIsVisible(readIsVisible());
        updater();
        return subscribeMockBackButton(updater);
    }, []);

    return isVisible;
}
