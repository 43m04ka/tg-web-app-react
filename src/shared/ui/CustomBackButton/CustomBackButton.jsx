import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {useTelegram, clickMockBackButton, useMockBackButton} from '../../../hooks/useTelegram';
import style from './CustomBackButton.module.scss';

const RESERVED_TOP_SEGMENTS = new Set([
    'favorites', 'catalog', 'card', 'choice-catalog', 'admin-panel', 'admin', 'history', 'danya_dr'
]);

function isStoreMainHome(pathname) {
    const seg = pathname.split('/').filter(Boolean);
    if (seg.length !== 1) return false;
    return !RESERVED_TOP_SEGMENTS.has(seg[0].toLowerCase());
}

const HEADER_INNER_PAD_Y = 10;
/** Matches desktop header row: logo 44px + .logoButton vertical padding 6+6 */
const HEADER_ROW_MIN = 56;

const CustomBackButton = () => {
    const {isVk, isWeb, tg, contentSafeAreaInset} = useTelegram();
    const isVisible = useMockBackButton();
    const location = useLocation();
    const [isDesktop, setIsDesktop] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
    );

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const onChange = () => setIsDesktop(mq.matches);
        mq.addEventListener('change', onChange);
        setIsDesktop(mq.matches);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const hideOnDesktopMain = isDesktop && isStoreMainHome(location.pathname);

    useEffect(() => {
        if (!isVk && !isWeb) return;
        if (hideOnDesktopMain && tg?.BackButton?.hide) {
            tg.BackButton.hide();
        }
    }, [hideOnDesktopMain, isVk, isWeb, tg]);

    if (!isVk && !isWeb) return null;
    if (hideOnDesktopMain) return null;

    const useDesktopChrome = isDesktop && isVisible;
    const desktopCenterTop =
        contentSafeAreaInset.top + HEADER_INNER_PAD_Y + HEADER_ROW_MIN / 2;

    const desktopContainerStyle = isDesktop
        ? {
            top: desktopCenterTop,
            left: 20,
            padding: 0,
            transform: isVisible ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.95)',
        }
        : undefined;

    return (
        <div
            className={`${style.container} ${isVisible ? style.visible : ''} ${useDesktopChrome ? style.desktop : ''}`}
            style={desktopContainerStyle}
        >
            <div
                className={style.button}
                onClick={() => {
                    if (isVisible) clickMockBackButton();
                }}
                role="button"
                tabIndex={isVisible ? 0 : -1}
                aria-hidden={!isVisible}
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Назад</span>
            </div>
        </div>
    );
};

export default CustomBackButton;
