import {useEffect, useRef, useState} from 'react';
import {useProductStore} from '../../store/useProductStore';
import {peekRecommendations, takeRecommendations} from './recommendQueue';

export function useRecommendations(pageId) {
    const rememberPreviews = useProductStore((state) => state.rememberPreviews);

    const [list, setList] = useState(() => peekRecommendations(pageId));

    const takenRef = useRef(null);

    useEffect(() => {
        if (pageId === null || pageId === undefined) return undefined;
        if (takenRef.current === pageId) return undefined;

        takenRef.current = pageId;

        let isAlive = true;

        takeRecommendations(pageId).then((batch) => {
            if (!isAlive || batch.length === 0) return;

            rememberPreviews(batch);
            setList(batch);
        });

        return () => {
            isAlive = false;
        };
    }, [pageId, rememberPreviews]);

    return list;
}
