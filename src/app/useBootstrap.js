import {useEffect, useRef, useState} from 'react';
import {usePlatformUser} from '../shared/hooks/usePlatformUser';
import {usePlatform} from '../shared/hooks/usePlatform';
import {configureTelegramViewport} from '../shared/lib/telegram';
import {useTelegramSdk} from '../shared/hooks/useTelegramSdk';
import {syncUser} from '../shared/api/structure';
import {loadPriceRules} from '../shared/api/priceRules';
import {warmRecommendations} from '../pages/Basket/recommendQueue';
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
    const setSyncFailed = useSessionStore((state) => state.setSyncFailed);
    const setPlatform = useSessionStore((state) => state.setPlatform);
    const syncToken = useSessionStore((state) => state.syncToken);
    const pageId = useSessionStore((state) => state.pageId);

    const loadStructure = useStructureStore((state) => state.load);
    const isStructureReady = useStructureStore(selectIsStructureReady);
    const pages = useStructureStore((state) => state.pages);

    const [isTimedOut, setIsTimedOut] = useState(false);

    const userRef = useRef(user);
    userRef.current = user;

    const userKey = isUserReady && user ? userKeyOf(user) : null;

    useEffect(() => {
        configureTelegramViewport();
    }, []);

    useEffect(() => {
        setPlatform(platform);
    }, [platform, setPlatform]);

    useEffect(() => {
        loadStructure();
    }, [loadStructure]);

    useEffect(() => {
        const timerId = setTimeout(() => setIsTimedOut(true), BOOTSTRAP_TIMEOUT_MS);
        return () => clearTimeout(timerId);
    }, []);

    useEffect(() => {
        if (isUserReady && user) setUser(user);
    }, [user, isUserReady, setUser]);

    useEffect(() => {
        if (!userKey) return undefined;

        const controller = new AbortController();

        syncUser(userRef.current, controller.signal)
            .then((internalId) => {
                if (controller.signal.aborted) return;
                if (internalId) setInternalUserId(internalId);
                else setSyncFailed();
            })
            .catch((error) => {
                if (controller.signal.aborted) return;
                console.error('[bootstrap] syncUser:', error.message);
                setSyncFailed();
            });

        return () => controller.abort();
    }, [userKey, syncToken, setInternalUserId, setSyncFailed]);

    useEffect(() => {
        if (pageId === null || pageId === undefined) return;

        warmRecommendations(pageId);

        const isIndia = (pages || []).find((page) => page.id === pageId)?.type === 'ps_india';

        if (isIndia) loadPriceRules('india').catch(() => undefined);
    }, [pageId, pages]);

    return {
        isReady: isStructureReady && (isTimedOut || (isUserReady && isPlatformResolved)),
        isTimedOut
    };
}
