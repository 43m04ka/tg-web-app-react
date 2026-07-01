import {useCallback, useLayoutEffect} from 'react';

/**
 * Позиционирует выпадающую панель поиска и затемнение под шапкой.
 */
export function useDesktopSearchPanelLayout({
    searchOverlayMounted,
    searchOverlayOpen,
    query,
    searchResults,
    searchLiveLoading,
    searchDebouncePending,
    panelRecommendations,
    searchRowRef,
    searchPanelShellRef,
    searchBackdropRef,
    headerRef,
}) {
    const applySearchPanelLayout = useCallback(() => {
        const row = searchRowRef.current;
        const shell = searchPanelShellRef.current;
        const backdrop = searchBackdropRef.current;
        const header = headerRef.current;
        if (!row || !shell) return;

        const vv = window.visualViewport;
        const vw = Math.round(vv?.width ?? document.documentElement.clientWidth ?? window.innerWidth);
        const vLeft = Math.round(vv?.offsetLeft ?? 0);
        const pad = 16;

        const rect = row.getBoundingClientRect();
        const availLeft = vLeft + pad;
        const availRight = vLeft + vw - pad;
        const availW = Math.max(0, availRight - availLeft);

        let maxW = Math.min(940, availW);
        const center = rect.left + rect.width / 2;
        let left = center - maxW / 2;
        left = Math.max(availLeft, Math.min(left, availRight - maxW));
        if (left + maxW > availRight) {
            maxW = Math.max(260, availRight - left);
        }

        shell.style.position = 'fixed';
        shell.style.boxSizing = 'border-box';
        shell.style.top = `${rect.bottom + 6}px`;
        shell.style.left = `${left}px`;
        shell.style.width = `${maxW}px`;
        shell.style.maxWidth = `${availW}px`;

        if (backdrop && header) {
            const hb = header.getBoundingClientRect().bottom;
            const vTop = Math.round(vv?.offsetTop ?? 0);
            const vh = Math.round(vv?.height ?? window.innerHeight);
            const bottomEdge = vTop + vh;
            backdrop.style.position = 'fixed';
            backdrop.style.left = `${vLeft}px`;
            backdrop.style.top = `${hb}px`;
            backdrop.style.width = `${vw}px`;
            backdrop.style.height = `${Math.max(0, bottomEdge - hb)}px`;
        }
    }, [searchRowRef, searchPanelShellRef, searchBackdropRef, headerRef]);

    useLayoutEffect(() => {
        if (!searchOverlayMounted) return;
        applySearchPanelLayout();
        const rowEl = searchRowRef.current;
        const ro = typeof ResizeObserver !== 'undefined' && rowEl
            ? new ResizeObserver(() => applySearchPanelLayout())
            : null;
        if (ro && rowEl) ro.observe(rowEl);
        window.addEventListener('resize', applySearchPanelLayout);
        window.addEventListener('scroll', applySearchPanelLayout, true);
        const vv = window.visualViewport;
        vv?.addEventListener('resize', applySearchPanelLayout);
        vv?.addEventListener('scroll', applySearchPanelLayout);
        return () => {
            ro?.disconnect();
            window.removeEventListener('resize', applySearchPanelLayout);
            window.removeEventListener('scroll', applySearchPanelLayout, true);
            vv?.removeEventListener('resize', applySearchPanelLayout);
            vv?.removeEventListener('scroll', applySearchPanelLayout);
        };
    }, [searchOverlayMounted, applySearchPanelLayout, searchRowRef]);

    useLayoutEffect(() => {
        if (!searchOverlayMounted) return;
        applySearchPanelLayout();
    }, [
        searchOverlayMounted,
        applySearchPanelLayout,
        query,
        searchResults,
        searchLiveLoading,
        searchDebouncePending,
        panelRecommendations,
    ]);

    useLayoutEffect(() => {
        const shell = searchPanelShellRef.current;
        if (!shell || !searchOverlayMounted) return;
        shell.style.transform = searchOverlayOpen ? 'translateY(0)' : 'translateY(-8px)';
    }, [searchOverlayOpen, searchOverlayMounted, searchPanelShellRef]);
}
