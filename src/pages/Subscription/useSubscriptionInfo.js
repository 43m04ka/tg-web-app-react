import {useEffect, useState} from 'react';
import {loadSubscriptionInfo, peekSubscriptionInfo} from '../../shared/api/subscriptionInfo';

export function useSubscriptionInfo(catalogId) {
    const [info, setInfo] = useState(() => (catalogId === null ? null : peekSubscriptionInfo(catalogId)));

    useEffect(() => {
        if (catalogId === null || catalogId === undefined) return undefined;

        let alive = true;
        setInfo(peekSubscriptionInfo(catalogId));

        loadSubscriptionInfo(catalogId)
            .then((value) => {
                if (alive) setInfo(value);
            })
            .catch(() => undefined);

        return () => {
            alive = false;
        };
    }, [catalogId]);

    return info;
}
