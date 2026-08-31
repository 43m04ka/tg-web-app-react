import React from 'react';
import {usePlatform} from '../../hooks/usePlatform';
import {useMockBackButton} from '../../hooks/useMockBackButton';
import {useAppInsets} from '../../hooks/useAppInsets';
import {clickMockBackButton} from '../../lib/telegram';
import style from './BackButton.module.scss';

export default function BackButton() {
    const {isVk, isWeb} = usePlatform();
    const isVisible = useMockBackButton();
    const {contentSafeAreaInset} = useAppInsets();

    if (!isVk && !isWeb) return null;

    return (
        <div
            className={`${style.container} ${isVisible ? style.visible : ''}`}
            style={{top: contentSafeAreaInset.top}}
            aria-hidden={!isVisible}
        >
            <button type="button" className={style.button} onClick={clickMockBackButton} tabIndex={isVisible ? 0 : -1}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M15 19L8 12L15 5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span>Назад</span>
            </button>
        </div>
    );
}
