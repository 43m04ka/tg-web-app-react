import React, {useEffect, useRef, useState} from "react";
import style from "./ShareCatalogButton.module.scss";

const ShareCatalogButton = ({catalogPath, isTg}) => {
    const [phase, setPhase] = useState('idle');
    const timersRef = useRef([]);

    const clearTimers = () => {
        timersRef.current.forEach((timerId) => clearTimeout(timerId));
        timersRef.current = [];
    };

    useEffect(() => {
        return () => clearTimers();
    }, []);

    const runAnimation = () => {
        clearTimers();
        setPhase('expanded');
        timersRef.current.push(setTimeout(() => setPhase('fading'), 1300));
        timersRef.current.push(setTimeout(() => setPhase('idle'), 1750));
    };

    const onShare = async () => {
        const url = isTg
            ? `https://t.me/gwstore_bot/app?startapp=catalog_${catalogPath}`
            : `${window.location.origin}?startapp=catalog_${catalogPath}`;

        try {
            await navigator.clipboard.writeText(url);
            window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('soft');
            runAnimation();
        } catch (e) {
        }
    };

    return (
        <div className={style['shareCatalogWrap']}>
            <button
                className={`${style['shareCatalogBtn']} ${phase !== 'idle' ? style['shareCatalogBtnExpanded'] : ''} ${phase === 'expanded' ? style['shareCatalogBtnVisible'] : ''} ${phase === 'fading' ? style['shareCatalogBtnFading'] : ''}`}
                onClick={onShare}
                aria-label={phase === 'idle' ? 'Поделиться каталогом' : 'Ссылка скопирована'}
            >
                <div className={style['shareCatalogIcon']}/>
                <span className={style['shareCatalogText']}>Скопировано!</span>
            </button>
        </div>
    );
};

export default ShareCatalogButton;
