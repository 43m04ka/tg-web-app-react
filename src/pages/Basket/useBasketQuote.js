import {useCallback, useEffect, useMemo, useState} from 'react';
import {loadPriceRules, peekPriceRules} from '../../shared/api/priceRules';
import {buildQuote} from './quoteLocal';

const INDIA = 'india';

export function useBasketQuote({items, pageType, promo}) {
    const [rules, setRules] = useState(() => peekPriceRules(INDIA));
    const [isFailed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    const needsRules = pageType === 'ps_india';

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

    const quote = useMemo(
        () => (pageType === undefined ? null : buildQuote({items, pageType, promo, indiaRules: rules})),
        [items, pageType, promo, rules]
    );

    const retry = useCallback(() => setAttempt((value) => value + 1), []);

    const isKnown = Array.isArray(items) && pageType !== undefined;
    const isRulesReady = !needsRules || Boolean(rules);

    return {
        quote,
        isLoading: !isKnown || (!isRulesReady && !isFailed),
        error: isKnown && (isFailed || (isRulesReady && quote === null)),
        retry
    };
}
