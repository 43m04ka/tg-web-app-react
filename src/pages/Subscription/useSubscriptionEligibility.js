import {useCallback, useMemo, useRef, useState} from 'react';
import {selectUserId, useSessionStore} from '../../store/useSessionStore';
import {useCartStore} from '../../store/useCartStore';
import {applySubscriptionPricing, hasSubscriptionDiscount, isPsPlus} from '../../shared/lib/subscriptionPricing';

export function useSubscriptionEligibility(catalogId, items) {
    const userId = useSessionStore(selectUserId);
    const cartItems = useCartStore((state) => state.items);
    const updateEligibility = useCartStore((state) => state.setSubscriptionEligibility);
    const [choices, setChoices] = useState({});
    const [isUpdating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const pending = useRef(false);
    const saved = cartItems?.find((item) => item.catalogId === catalogId && isPsPlus(item));
    const noActiveSubscription = choices[catalogId] ?? saved?.noActiveSubscription ?? true;
    const isVisible = Boolean(items?.some(hasSubscriptionDiscount));
    const pricedItems = useMemo(
        () => items?.map((item) => applySubscriptionPricing(item, noActiveSubscription)) ?? null,
        [items, noActiveSubscription]
    );

    const changeEligibility = useCallback(async (checked) => {
        if (pending.current) return;
        const previous = noActiveSubscription;
        setError(null);
        setChoices((state) => ({...state, [catalogId]: checked}));
        pending.current = true;
        setUpdating(true);
        try {
            await updateEligibility(userId, catalogId, checked);
        } catch (error) {
            setChoices((state) => ({...state, [catalogId]: previous}));
            setError('Не удалось изменить условия подписки. Попробуйте ещё раз.');
        } finally {
            pending.current = false;
            setUpdating(false);
        }
    }, [userId, catalogId, noActiveSubscription, updateEligibility]);

    return {pricedItems, noActiveSubscription, isVisible, isUpdating, error, changeEligibility};
}
