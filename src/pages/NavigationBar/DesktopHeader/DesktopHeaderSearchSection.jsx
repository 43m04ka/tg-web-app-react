import React from 'react';
import DesktopSearchPanel from './DesktopSearchPanel';
import style from '../DesktopHeader.module.scss';

function SearchClearIcon() {
    return (
        <svg className={style['searchClearSvg']} width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <path
                d="M2 2L10 10M10 2L2 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

/** Средняя колонка шапки: поле поиска и выпадающая панель (без backdrop — он в DesktopHeader). */
const DesktopHeaderSearchSection = ({search, clues, products}) => {
    const {
        inputRef,
        searchFieldRef,
        searchRowRef,
        searchPanelShellRef,
        query,
        setQuery,
        searchOverlayMounted,
        searchOverlayOpen,
        searchResults,
        searchAwaitingResults,
        runSearch,
        clearSearchField,
        onSearchFieldFocus,
        onSearchFieldBlur,
    } = search;

    return (
        <div
            className={style['searchField']}
            ref={searchFieldRef}
            onFocus={onSearchFieldFocus}
            onBlur={onSearchFieldBlur}
        >
            <div className={style['searchRow']} ref={searchRowRef}>
                <div className={style['searchInputWrap']}>
                    <input
                        ref={inputRef}
                        className={style['searchInput']}
                        value={query}
                        placeholder="Найти игру, подписку..."
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') runSearch(query);
                        }}
                    />
                    {query.trim() ? (
                        <button
                            type="button"
                            className={style['searchClear']}
                            aria-label="Очистить"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={clearSearchField}
                        >
                            <SearchClearIcon />
                        </button>
                    ) : null}
                </div>
                <button type="button" className={style['searchSubmit']} onMouseDown={(e) => e.preventDefault()} onClick={() => runSearch(query)}>
                    Поиск
                </button>
            </div>
            {searchOverlayMounted && (
                <div
                    ref={searchPanelShellRef}
                    className={`${style['searchPanelShell']} ${searchOverlayOpen ? style['searchPanelShellOpen'] : ''}`}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <DesktopSearchPanel
                        query={query}
                        searchResults={searchResults}
                        searchAwaitingResults={searchAwaitingResults}
                        clues={clues}
                        products={products}
                        onPickQuery={(text) => {
                            setQuery(text);
                            runSearch(text);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default DesktopHeaderSearchSection;
