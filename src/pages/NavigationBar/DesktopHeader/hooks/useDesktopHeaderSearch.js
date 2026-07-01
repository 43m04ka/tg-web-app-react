import {useCallback, useEffect, useRef, useState} from 'react';
import {firstSegmentBasePath, pathnameEndsWithSearch} from '../desktopSearchPaths';

let searchTimer = -1;
let lastSearchTime = new Date();
const searchRequestInFlight = {n: 0};

export function useDesktopHeaderSearch({location, navigate, pageId, getSearch}) {
    const inputRef = useRef(null);
    const searchFieldRef = useRef(null);
    const searchRowRef = useRef(null);
    const searchPanelShellRef = useRef(null);
    const searchBackdropRef = useRef(null);

    const [query, setQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchOverlayMounted, setSearchOverlayMounted] = useState(false);
    const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [searchLiveLoading, setSearchLiveLoading] = useState(false);
    const [searchDebouncePending, setSearchDebouncePending] = useState(false);

    const onSearchPage = pathnameEndsWithSearch(location.pathname);
    const basePath = firstSegmentBasePath(location.pathname);

    useEffect(() => {
        setIsSearchFocused(false);
        setSearchOverlayOpen(false);
        setSearchOverlayMounted(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!onSearchPage) return;
        setQuery(new URLSearchParams(location.search).get('q') || '');
    }, [location.pathname, location.search, onSearchPage]);

    useEffect(() => {
        if (isSearchFocused && !onSearchPage) {
            setSearchOverlayMounted(true);
            const openId = window.setTimeout(() => setSearchOverlayOpen(true), 0);
            return () => window.clearTimeout(openId);
        }
        setSearchOverlayOpen(false);
        const closeId = window.setTimeout(() => setSearchOverlayMounted(false), 220);
        return () => window.clearTimeout(closeId);
    }, [isSearchFocused, onSearchPage]);

    const doLiveSearch = useCallback((text) => {
        if (!text.trim()) {
            setSearchResults(null);
            setSearchLiveLoading(false);
            searchRequestInFlight.n = 0;
            return;
        }
        searchRequestInFlight.n += 1;
        setSearchLiveLoading(true);
        const startTime = new Date();
        getSearch((res) => {
            if (startTime > lastSearchTime) {
                lastSearchTime = startTime;
                setSearchResults(res);
            }
            searchRequestInFlight.n = Math.max(0, searchRequestInFlight.n - 1);
            if (searchRequestInFlight.n === 0) {
                setSearchLiveLoading(false);
            }
        }, text, pageId, {sorting: 'default', platform: [], language: [], numberPlayers: [], genre: [], type: []});
    }, [pageId, getSearch]);

    useEffect(() => {
        window.clearTimeout(searchTimer);
        if (onSearchPage) {
            setSearchLiveLoading(false);
            searchRequestInFlight.n = 0;
            setSearchResults(null);
            const currentQ = (new URLSearchParams(location.search).get('q') || '').trim();
            const nextQ = query.trim();
            if (nextQ === currentQ) {
                setSearchDebouncePending(false);
                return () => window.clearTimeout(searchTimer);
            }
            setSearchDebouncePending(true);
            searchTimer = window.setTimeout(() => {
                setSearchDebouncePending(false);
                if (nextQ) {
                    navigate(`${basePath}/search?q=${encodeURIComponent(nextQ)}`, {replace: true});
                } else {
                    navigate(`${basePath}/search`, {replace: true});
                }
            }, 300);
            return () => window.clearTimeout(searchTimer);
        }
        if (query.trim()) {
            setSearchDebouncePending(true);
            searchTimer = window.setTimeout(() => {
                setSearchDebouncePending(false);
                doLiveSearch(query);
            }, 300);
        } else {
            setSearchDebouncePending(false);
            setSearchResults(null);
            setSearchLiveLoading(false);
            searchRequestInFlight.n = 0;
        }
        return () => window.clearTimeout(searchTimer);
    }, [query, doLiveSearch, onSearchPage, basePath, navigate, location.search]);

    const runSearch = useCallback((text) => {
        const prepared = text.trim();
        if (!prepared) return;
        setIsSearchFocused(false);
        inputRef.current?.blur();
        navigate(`${basePath}/search?q=${encodeURIComponent(prepared)}`);
    }, [basePath, navigate]);

    const clearSearchField = useCallback(() => {
        setQuery('');
        setSearchResults(null);
        setSearchDebouncePending(false);
        setSearchLiveLoading(false);
        searchRequestInFlight.n = 0;
        if (pathnameEndsWithSearch(location.pathname)) {
            navigate(`${basePath}/search`, {replace: true});
        }
        window.setTimeout(() => inputRef.current?.focus(), 0);
    }, [basePath, location.pathname, navigate]);

    const onSearchFieldFocus = useCallback(() => {
        setIsSearchFocused(true);
    }, []);

    const onSearchFieldBlur = useCallback((e) => {
        const next = e.relatedTarget;
        if (next && searchFieldRef.current?.contains(next)) return;
        const checkClose = () => {
            const field = searchFieldRef.current;
            if (!field?.contains(document.activeElement)) {
                setIsSearchFocused(false);
            }
        };
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(checkClose);
        });
    }, []);

    const dismissSearchBackdrop = useCallback((e) => {
        e.preventDefault();
        inputRef.current?.blur();
        window.requestAnimationFrame(() => {
            if (!searchFieldRef.current?.contains(document.activeElement)) {
                setIsSearchFocused(false);
            }
        });
    }, []);

    const searchAwaitingResults = Boolean(query.trim()) && (searchDebouncePending || searchLiveLoading);

    return {
        inputRef, searchFieldRef, searchRowRef, searchPanelShellRef, searchBackdropRef,
        query, setQuery, searchOverlayMounted, searchOverlayOpen, searchResults,
        searchLiveLoading, searchDebouncePending, searchAwaitingResults,
        runSearch, clearSearchField, onSearchFieldFocus, onSearchFieldBlur, dismissSearchBackdrop,
    };
}
