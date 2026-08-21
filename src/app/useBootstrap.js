import {useEffect, useRef, useState} from 'react';
import {usePlatformUser} from '../shared/hooks/usePlatformUser';
import {usePlatform} from '../shared/hooks/usePlatform';
import {configureTelegramViewport} from '../shared/lib/telegram';
import {useTelegramSdk} from '../shared/hooks/useTelegramSdk';
import {syncUser} from '../shared/api/structure';
import {BOOTSTRAP_TIMEOUT_MS} from '../shared/config/env';
import {useSessionStore} from '../store/useSessionStore';
import {selectIsStructureReady, useStructureStore} from '../store/useStructureStore';

const userKeyOf = (user) => `${user.platform}:${user.id}:${user.username || user.first_name || ''}`;

export function useBootstrap() {
    const platform = usePlatform();
    const {user, isUserReady} = usePlatformUser();
    const isPlatformResolved = useTelegramSdk() > 0;

    const setUser = useSessionStore((state) => state.setUser);
    const setInternalUserId = useSessionStore((state) => state.setInternalUserId);
    const setPlatform = useSessionStore((state) => state.setPlatform);

    const loadStructure = useStructureStore((state) => state.load);
    const isStructureReady = useStructureStore(selectIsStructureReady);

    const [isTimedOut, setIsTimedOut] = useState(false);
    const syncedKeyRef = useRef(null);

    useEffect(() => {
        configureTelegramViewport();
    }, []);

    useEffect(() => {
        setPlatform(platform);
    }, [platform, setPlatform]);

    useEffect(() => {
        const controller = new AbortController();
        loadStructure(controller.signal);
        return () => controller.abort();
    }, [loadStructure]);

    useEffect(() => {
        const timerId = setTimeout(() => setIsTimedOut(true), BOOTSTRAP_TIMEOUT_MS);
        return () => clearTimeout(timerId);
    }, []);

    useEffect(() => {
        if (!isUserReady || !user) return;

        setUser(user);

        const userKey = userKeyOf(user);
        if (syncedKeyRef.current === userKey) return;
        syncedKeyRef.current = userKey;

        const controller = new AbortController();
        syncUser(user, controller.signal)
            .then((internalId) => {
                if (internalId && !controller.signal.aborted) setInternalUserId(internalId);
            })
            .catch((error) => console.error('[bootstrap] syncUser:', error.message));

        return () => controller.abort();
    }, [user, isUserReady, setUser, setInternalUserId]);

    return {
        isReady: (isStructureReady && isUserReady && isPlatformResolved) || isTimedOut,
        isTimedOut
    };
}
