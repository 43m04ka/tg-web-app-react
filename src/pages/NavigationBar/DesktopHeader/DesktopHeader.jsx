import React, {Fragment, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useTelegram} from '../../../hooks/useTelegram';
import useGlobalData from '../../../hooks/useGlobalData';
import {useServerUser} from '../../../hooks/useServerUser';
import style from '../DesktopHeader.module.scss';
import {useDesktopHeaderNavigation} from './useDesktopHeaderNavigation';
import {useDesktopHeaderSearch} from './hooks/useDesktopHeaderSearch';
import {useDesktopSearchPanelLayout} from './hooks/useDesktopSearchPanelLayout';
import DesktopHeaderSearchSection from './DesktopHeaderSearchSection';
import logoIcon from '../../../shared/assets/icons/golo.png';
import basketIcon from '../../../shared/assets/icons/basket.png';
import moreIcon from '../../../shared/assets/icons/user.png';

const DesktopHeader = ({setOpacityTab, setZIndexTab}) => {
    const {contentSafeAreaInset} = useTelegram();
    const {pageId, pageList, updateBasket, basket, catalogList, setBufferCardsRecommendations} = useGlobalData();
    const {getSearch, getClueList, getRecommendationsGames} = useServerUser();
    const navigate = useNavigate();
    const location = useLocation();
    const headerRef = useRef(null);

    const [clueList, setClueList] = useState([]);
    const [panelRecommendations, setPanelRecommendations] = useState(null);

    const search = useDesktopHeaderSearch({location, navigate, pageId, getSearch});

    useDesktopSearchPanelLayout({
        searchOverlayMounted: search.searchOverlayMounted,
        searchOverlayOpen: search.searchOverlayOpen,
        query: search.query,
        searchResults: search.searchResults,
        searchLiveLoading: search.searchLiveLoading,
        searchDebouncePending: search.searchDebouncePending,
        panelRecommendations,
        searchRowRef: search.searchRowRef,
        searchPanelShellRef: search.searchPanelShellRef,
        searchBackdropRef: search.searchBackdropRef,
        headerRef,
    });

    const {activeTab, visibleButtons, onButtonClick} = useDesktopHeaderNavigation({
        pageList, pageId, updateBasket, catalogList, setOpacityTab, setZIndexTab, navigate, location,
    });

    useEffect(() => {
        getClueList((res) => setClueList(res || []));
    }, []);

    useEffect(() => {
        getRecommendationsGames((res) => {
            const list = res || [];
            setPanelRecommendations(list);
            setBufferCardsRecommendations(list);
        }, pageId).then();
    }, [pageId, getRecommendationsGames, setBufferCardsRecommendations]);

    const filteredClues = useMemo(
        () => clueList.filter((item) => item.structurePageId === pageId).slice(0, 12),
        [clueList, pageId],
    );

    const leftButtons = visibleButtons.filter((b) => b.id === 'home' || b.id === 'platform');
    const rightButtons = visibleButtons.filter((b) => b.id === 'basket' || b.id === 'more');
    const iconMap = {basket: basketIcon, more: moreIcon};

    return (
        <Fragment>
            {search.searchOverlayMounted && (
                <div
                    ref={search.searchBackdropRef}
                    className={style['searchBackdrop']}
                    onMouseDown={search.dismissSearchBackdrop}
                    aria-hidden
                />
            )}
            <header ref={headerRef} className={style['header']} style={{paddingTop: String(contentSafeAreaInset.top) + 'px'}}>
                <div className={style['inner']}>
                    <div className={style['left']}>
                        {leftButtons.map((button) =>
                            button.id === 'home' ? (
                                <button key="home" className={style['logoButton']} type="button" onClick={() => onButtonClick(button)}>
                                    <img src={logoIcon} alt="logo" className={style['logoImg']} />
                                </button>
                            ) : (
                                <button key={button.id} type="button" className={`${style['actionButton']} ${activeTab === button.id ? style['active'] : ''}`} onClick={() => onButtonClick(button)}>
                                    {button.label}
                                </button>
                            ),
                        )}
                    </div>
                    <DesktopHeaderSearchSection search={search} clues={filteredClues} products={panelRecommendations || []} />
                    <div className={style['right']}>
                        {rightButtons.map((button) => (
                            <button key={button.id} type="button" className={`${style['actionButton']} ${activeTab === button.id ? style['active'] : ''}`} onClick={() => onButtonClick(button)}>
                                <span className={style['iconWrap']}>
                                    <img src={iconMap[button.id]} alt="" className={style['btnIcon']} />
                                    {button.id === 'basket' && basket !== null && basket.length !== 0 && (
                                        <span className={style['counter']}>{basket.length}</span>
                                    )}
                                </span>
                                <span>{button.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>
        </Fragment>
    );
};

export default DesktopHeader;
