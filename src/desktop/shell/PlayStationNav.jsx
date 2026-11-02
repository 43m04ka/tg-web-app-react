import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import PlatformCard from '../../pages/SelectPlatform/PlatformCard';
import {readPlayStationRegion, rememberPlayStationRegion} from '../model/playstationSession';
import {useScrollArea} from './ScrollAreaContext';
import {ChevronIcon, FlagIcon} from './DesktopIcons';
import style from './PlayStationNav.module.scss';

const REGIONS = {
    ps: {name: 'Турция', flag: 'tr', note: 'Популярный регион 🔥', icon: '/start-icons/turkey.webp', color: '#df4335'},
    ps_india: {name: 'Индия', flag: 'in', note: 'Дешевле новинки 💸', icon: '/start-icons/india.webp', color: '#d79714'}
};

export default function PlayStationNav({items, scopeId, onSelect}) {
    const [isOpen, setOpen] = useState(false);
    const [isClosing, setClosing] = useState(false);
    const [pendingId, setPendingId] = useState(null);
    const [preferredType, setPreferredType] = useState(readPlayStationRegion);
    const closingRef = useRef(false);
    const closeTimerRef = useRef(null);
    const triggerRef = useRef(null);
    const dialogRef = useRef(null);
    const areaRef = useScrollArea();
    const activeItem = items.find((item) => item.id === scopeId) || null;
    const preferredItem = items.find((item) => item.type === preferredType) || null;
    const selectedItem = activeItem || preferredItem;
    const selectedRegion = selectedItem ? REGIONS[selectedItem.type] : null;
    const active = Boolean(activeItem);

    const open = useCallback(() => {
        clearTimeout(closeTimerRef.current);
        closingRef.current = false;
        setClosing(false);
        setPendingId(null);
        setOpen(true);
    }, []);

    const close = useCallback((afterClose) => {
        if (closingRef.current) return;
        closingRef.current = true;
        const finish = () => {
            setOpen(false);
            setClosing(false);
            setPendingId(null);
            closingRef.current = false;
            if (typeof afterClose === 'function') afterClose();
        };
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) finish();
        else {
            setClosing(true);
            closeTimerRef.current = setTimeout(finish, 180);
        }
    }, []);

    useEffect(() => () => clearTimeout(closeTimerRef.current), []);

    useEffect(() => {
        if (!isOpen) return undefined;
        const previousFocus = document.activeElement;
        const node = areaRef?.current;
        const previousOverflow = node?.style.overflowY;
        if (node) node.style.overflowY = 'hidden';
        dialogRef.current?.querySelector('button')?.focus();
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                close();
            }
            if (event.key !== 'Tab') return;
            const buttons = [...dialogRef.current.querySelectorAll('button, a[href]')];
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            if (node) node.style.overflowY = previousOverflow;
            previousFocus?.focus();
        };
    }, [isOpen, areaRef, close]);

    if (!items.length) return null;

    const pick = (item) => {
        if (closingRef.current) return;
        setPendingId(item.id);
        close(() => {
            setPreferredType(item.type);
            rememberPlayStationRegion(item.type);
            onSelect(item);
        });
    };

    return (
        <div className={style.group} data-active={active || undefined}>
            <button ref={triggerRef} type="button" className={style.title} data-selected={Boolean(selectedRegion) || undefined}
                aria-label="PlayStation" title={selectedRegion ? `PlayStation — ${selectedRegion.name}` : undefined}
                aria-haspopup="dialog" aria-expanded={isOpen && !isClosing} onClick={open}>
                <span className={style.label}>PlayStation</span>
                {selectedRegion ? <span className={style.selection} key={selectedItem.type}>
                    <FlagIcon code={selectedRegion.flag} className={style.smallFlag} aria-hidden="true"/>
                    <ChevronIcon className={style.chevron} aria-hidden="true"/>
                </span> : null}
            </button>
            {isOpen ? createPortal(
                <div className={style.overlay} data-closing={isClosing || undefined} onClick={() => close()}>
                    <section ref={dialogRef} className={style.dialog} role="dialog" aria-modal="true"
                        aria-labelledby="playstation-region-title"
                        onClick={(event) => event.stopPropagation()}>
                        <button type="button" className={style.close} aria-label="Закрыть выбор региона"
                            onClick={() => close()}>
                            <svg className={style.closeIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                        <h2 id="playstation-region-title">Выберите регион PlayStation</h2>
                        <div className={style.cards}>
                            {items.map((item) => <PlatformCard key={item.id} isTile
                                item={{...item, title: REGIONS[item.type].name,
                                    text: String(item.note || '').trim() || REGIONS[item.type].note,
                                    icon: item.choiceIcon || REGIONS[item.type].icon,
                                    color: item.choiceColor || REGIONS[item.type].color}}
                                isActive={(pendingId ?? selectedItem?.id) === item.id} onSelect={() => pick(item)}/>)}
                        </div>
                    </section>
                </div>, document.body
            ) : null}
        </div>
    );
}
