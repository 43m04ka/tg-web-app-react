import {useCallback, useEffect, useRef, useState} from 'react';
import {fetchTextPage, fetchTextPages} from '../api/textPages';

let linksPromise = null;

const loadLinks = () => {
    if (!linksPromise) {
        linksPromise = fetchTextPages({section: 'page'})
            .then((payload) => payload.items)
            .catch(() => {
                linksPromise = null;
                return [];
            });
    }

    return linksPromise;
};

export function useTextPageLinks() {
    const [pages, setPages] = useState([]);

    useEffect(() => {
        let isActive = true;

        loadLinks().then((items) => {
            if (isActive) setPages(items);
        });

        return () => {
            isActive = false;
        };
    }, []);

    return pages;
}

export function useTextPage(slug) {
    const [state, setState] = useState({page: null, status: 'loading'});
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!slug) {
            setState({page: null, status: 'missing'});
            return undefined;
        }

        const controller = new AbortController();
        setState({page: null, status: 'loading'});

        fetchTextPage(slug, controller.signal)
            .then((page) => setState(page ? {page, status: 'ready'} : {page: null, status: 'missing'}))
            .catch((error) => {
                if (controller.signal.aborted) return;
                setState({page: null, status: error.status === 404 ? 'missing' : 'error'});
            });

        return () => controller.abort();
    }, [slug, attempt]);

    const reload = useCallback(() => setAttempt((value) => value + 1), []);

    return {...state, reload};
}

export function useTextPageList({section, tag = '', pageSize = 24}) {
    const [state, setState] = useState({items: [], total: 0, status: 'loading'});
    const [attempt, setAttempt] = useState(0);
    const requestRef = useRef(0);

    useEffect(() => {
        const controller = new AbortController();
        const requestId = ++requestRef.current;

        setState({items: [], total: 0, status: 'loading'});

        fetchTextPages({section, tag, limit: pageSize, offset: 0}, controller.signal)
            .then((payload) => {
                if (requestRef.current === requestId) setState({...payload, status: 'ready'});
            })
            .catch(() => {
                if (!controller.signal.aborted) setState({items: [], total: 0, status: 'error'});
            });

        return () => controller.abort();
    }, [section, tag, pageSize, attempt]);

    const loadMore = useCallback(() => {
        if (state.status !== 'ready' || state.items.length >= state.total) return;

        const requestId = requestRef.current;
        setState((prev) => ({...prev, status: 'more'}));

        fetchTextPages({section, tag, limit: pageSize, offset: state.items.length})
            .then((payload) => {
                if (requestRef.current !== requestId) return;

                setState((prev) => ({
                    items: [...prev.items, ...payload.items],
                    total: payload.total,
                    status: 'ready'
                }));
            })
            .catch(() => {
                if (requestRef.current === requestId) setState((prev) => ({...prev, status: 'ready'}));
            });
    }, [section, tag, pageSize, state.status, state.items.length, state.total]);

    const reload = useCallback(() => setAttempt((value) => value + 1), []);

    return {
        ...state,
        hasMore: state.items.length < state.total,
        isLoadingMore: state.status === 'more',
        loadMore,
        reload
    };
}
