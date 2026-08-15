import {useEffect, useState} from 'react';
import {getPlatformState} from './platform';

export function usePlatform() {
    const [state, setState] = useState(getPlatformState());
    useEffect(() => {
        let checksCount = 0;
        const maxChecks = 10;

        const intervalId = setInterval(() => {
            checksCount++;

            const newState = getPlatformState();

            // Обновляем стейт, только если данные действительно изменились
            setState(prev => {
                if (
                    prev.isVk === newState.isVk &&
                    prev.isTg === newState.isTg &&
                    prev.botType === newState.botType
                ) {
                    return prev;
                }
                return newState;
            });

            if (checksCount >= maxChecks) {
                clearInterval(intervalId);
            }
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

    return state;
}