import {useEffect, useRef, useState} from 'react';
import {useProductStore} from '../../store/useProductStore';
import {peekRecommendations, takeRecommendations} from './recommendQueue';

export function useRecommendations(pageId, count) {
    const rememberPreviews = useProductStore((state) => state.rememberPreviews);

    const [list, setList] = useState(() => peekRecommendations(pageId, count));

    const takenRef = useRef(null);

    useEffect(() => {
        if (pageId === null || pageId === undefined) return undefined;
        if (takenRef.current === pageId) return undefined;

        takenRef.current = pageId;

        let isAlive = true;

        takeRecommendations(pageId, count).then((batch) => {
            if (!isAlive || batch.length === 0) return;

            rememberPreviews(batch);
            setList(batch);
        });

        return () => {
            isAlive = false;
        };
    }, [pageId, count, rememberPreviews]);

    return list;
}
