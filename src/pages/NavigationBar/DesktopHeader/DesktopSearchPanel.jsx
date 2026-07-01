import React from "react";
import style from "../DesktopHeader.module.scss";
import Recommendations from "../../../shared/ui/Recommendations/Recommendations";

const DesktopSearchPanel = ({query, searchResults, searchAwaitingResults, clues, products, onPickQuery}) => {
    const hasQuery = query.trim().length > 0;
    const hasResults = searchResults !== null && searchResults.length > 0;
    const showSearchLoader = hasQuery && searchAwaitingResults;
    const showEmpty = hasQuery && !searchAwaitingResults && searchResults !== null && searchResults.length === 0;
    const showResults = hasQuery && !searchAwaitingResults && hasResults;
    const showBelowFold = !hasQuery || showEmpty || showSearchLoader;

    return (
        <div className={style['searchPanel']}>
            {showSearchLoader && (
                <section className={style['panelSection']}>
                    <div className={style['panelTitle']}>Результаты</div>
                    <div className={style['liveSearchLoader']} aria-busy="true" aria-live="polite">
                        <div className={style['liveSearchLoaderInner']}>
                            <div className={style['liveSearchCircle']}/>
                            <div className={style['liveSearchCircle']}/>
                            <div className={style['liveSearchCircle']}/>
                            <div className={style['liveSearchShadow']}/>
                            <div className={style['liveSearchShadow']}/>
                            <div className={style['liveSearchShadow']}/>
                        </div>
                    </div>
                </section>
            )}
            {showResults && (
                <section className={style['panelSection']}>
                    <div className={style['panelTitle']}>Результаты</div>
                    <Recommendations
                        data={searchResults.slice(0, 8)}
                        desktopPanel
                        from="search"
                    />
                </section>
            )}
            {showEmpty && (
                <section className={style['panelSection']}>
                    <div className={style['emptyNotFound']}>Ничего не найдено</div>
                    <p className={style['emptySub']}>Попробуйте другой запрос — ниже подборка для этой страницы.</p>
                </section>
            )}
            {showBelowFold && (
                <>
                    {clues.length > 0 && (
                        <section className={style['panelSection']}>
                            <div className={style['panelTitle']}>Рекомендуем запросы</div>
                            <div className={style['chipList']}>
                                {clues.map((item) => (
                                    <button key={item.id || item.name} type="button" className={style['chip']} onClick={() => onPickQuery(item.name)}>
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}
                    {products.length > 0 && (
                        <section className={style['panelSection']}>
                            <div className={style['panelTitle']}>Рекомендуем для вас</div>
                            <Recommendations
                                data={products.slice(0, 8)}
                                desktopPanel
                                from="search"
                            />
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default DesktopSearchPanel;
