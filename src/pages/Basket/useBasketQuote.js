import {useCallback, useEffect, useMemo, useState} from 'react';
import {loadPriceRules, peekPriceRules} from '../../shared/api/priceRules';
import {fetchBasketQuote} from '../../shared/api/basket';
import {selectUserId, useSessionStore} from '../../store/useSessionStore';
import {buildQuote} from './quoteLocal';

const INDIA = 'india';
const SERVER_QUOTE_DELAY_MS = 450;

export function useBasketQuote({items, pageType, promo}) {
    const [rules, setRules] = useState(() => peekPriceRules(INDIA));
    const [isFailed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [serverQuote, setServerQuote] = useState(null);
    const [isServerFailed, setServerFailed] = useState(false);

    const userId = useSessionStore(selectUserId);
    const pageId = useSessionStore((state) => state.pageId);

    const needsRules = pageType === 'ps_india';
    const usesServer = needsRules && !rules && isFailed;
    const itemsKey = (items || []).map((item) => `${item.id}:${item.count}`).join(',');
    const promoName = promo?.name || null;

    useEffect(() => {
        if (!needsRules || rules) return undefined;

        let isAlive = true;

        setFailed(false);

        loadPriceRules(INDIA)
            .then((list) => {
                if (isAlive) setRules(list);
            })
            .catch(() => {
                if (isAlive) setFailed(true);
            });

        return () => {
            isAlive = false;
        };
    }, [needsRules, rules, attempt]);

    useEffect(() => {
        if (!usesServer || !userId || !pageId) return undefined;

        const controller = new AbortController();

        setServerFailed(false);

        const timerId = setTimeout(() => {
            fetchBasketQuote({userId, pageId, promoCode: promoName}, controller.signal)
                .then((result) => {
                    if (controller.signal.aborted) return;
                    if (result) setServerQuote(result);
                    else setServerFailed(true);
                })
                .catch(() => {
                    if (!controller.signal.aborted) setServerFailed(true);
                });
        }, SERVER_QUOTE_DELAY_MS);

        return () => {
            clearTimeout(timerId);
            controller.abort();
        };
    }, [usesServer, userId, pageId, itemsKey, promoName, attempt]);

    const localQuote = useMemo(
        () => (pageType === undefined || usesServer ? null : buildQuote({items, pageType, promo, indiaRules: rules})),
        [items, pageType, promo, rules, usesServer]
    );

    const retry = useCallback(() => setAttempt((value) => value + 1), []);

    const isKnown = Array.isArray(items) && pageType !== undefined;
    const isRulesReady = !needsRules || Boolean(rules);

    if (usesServer) {
        return {
            quote: serverQuote,
            isLoading: !isKnown || (!serverQuote && !isServerFailed),
            error: isKnown && isServerFailed,
            retry
        };
    }

    return {
        quote: localQuote,
        isLoading: !isKnown || (!isRulesReady && !isFailed),
        error: isKnown && (isFailed || (isRulesReady && localQuote === null)),
        retry
    };
}
