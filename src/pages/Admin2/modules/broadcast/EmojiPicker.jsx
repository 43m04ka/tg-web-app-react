import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {BUTTON_EMOJI} from './broadcastModel';
import {EMOJI_GROUPS} from './emojiData';
import style from './BroadcastScreen.module.scss';

const RECENT_KEY = 'admin2.broadcast.emoji';
const RECENT_LIMIT = 24;

const readRecent = () => {
    try {
        const parsed = JSON.parse(window.localStorage.getItem(RECENT_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
    } catch {
        return [];
    }
};

const saveRecent = (list) => {
    try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch {
        void 0;
    }
};

const keepFocus = (event) => event.preventDefault();

const support = new Map();
let probe = null;
let baseWidth = 0;

const canDraw = (emoji) => {
    if (support.has(emoji)) return support.get(emoji);

    if (!probe) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        probe = canvas.getContext('2d', {willReadFrequently: true});
        if (!probe) return true;
        probe.font = '24px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
        probe.textBaseline = 'top';
        baseWidth = probe.measureText('😀').width || 24;
    }

    if (probe.measureText(emoji).width > baseWidth * 1.5) {
        support.set(emoji, false);
        return false;
    }

    probe.clearRect(0, 0, 32, 32);
    probe.fillText(emoji, 0, 0);

    const pixels = probe.getImageData(0, 0, 32, 32).data;
    let colored = false;

    for (let index = 0; index < pixels.length && !colored; index += 4) {
        if (pixels[index + 3] > 64 && (Math.abs(pixels[index] - pixels[index + 1]) > 24 || Math.abs(pixels[index + 1] - pixels[index + 2]) > 24)) {
            colored = true;
        }
    }

    support.set(emoji, colored);
    return colored;
};

const visible = (group) => (group.key === 'flags' ? group.items : group.items.filter(canDraw));

export function EmojiPanel({value, onPick, className = ''}) {
    const [tab, setTab] = useState('frequent');
    const [recent, setRecent] = useState(readRecent);

    const tabs = useMemo(() => [
        {key: 'frequent', title: 'Частые', icon: '🕘', items: [...new Set([...recent, ...BUTTON_EMOJI])]},
        ...EMOJI_GROUPS
    ], [recent]);

    const current = tabs.find((item) => item.key === tab) || tabs[0];
    const items = useMemo(() => visible(current), [current]);

    const pick = useCallback((emoji) => {
        const next = [emoji, ...recent.filter((item) => item !== emoji)].slice(0, RECENT_LIMIT);
        setRecent(next);
        saveRecent(next);
        onPick(emoji);
    }, [onPick, recent]);

    return (
        <div className={`${style.emojiPanel} ${className}`} role="dialog" aria-label="Выбор эмодзи" onMouseDown={keepFocus}>
            <div className={style.emojiTabs} role="tablist">
                {tabs.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        role="tab"
                        title={item.title}
                        aria-selected={item.key === current.key}
                        className={item.key === current.key ? `${style.emojiTab} ${style.emojiTabOn}` : style.emojiTab}
                        onClick={() => setTab(item.key)}
                    >
                        {item.icon}
                    </button>
                ))}
            </div>

            <span className={style.emojiGroupTitle}>{current.title}</span>

            <div className={style.emojiGrid}>
                {items.map((emoji) => (
                    <button
                        key={emoji}
                        type="button"
                        className={emoji === value ? `${style.emojiCell} ${style.emojiCellOn}` : style.emojiCell}
                        onClick={() => pick(emoji)}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function useDismiss(isOpen, rootRef, close) {
    useEffect(() => {
        if (!isOpen) return undefined;

        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) close();
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') close();
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen, rootRef, close]);
}

export default function EmojiPicker({value, disabled, onChange}) {
    const [isOpen, setOpen] = useState(false);
    const rootRef = useRef(null);
    const close = useCallback(() => setOpen(false), []);

    useDismiss(isOpen, rootRef, close);

    const pick = useCallback((emoji) => {
        onChange(emoji);
        setOpen(false);
    }, [onChange]);

    return (
        <div className={style.emojiPicker} ref={rootRef}>
            <button
                type="button"
                className={isOpen ? `${style.emojiTrigger} ${style.emojiTriggerOn}` : style.emojiTrigger}
                disabled={disabled}
                aria-expanded={isOpen}
                onClick={() => setOpen((open) => !open)}
            >
                <span className={style.emojiTriggerIcon}>{value || '🙂'}</span>
                {value ? 'Сменить эмодзи' : 'Эмодзи'}
            </button>

            {value ? (
                <button type="button" className={style.emojiClear} disabled={disabled} onClick={() => pick('')}>
                    Убрать
                </button>
            ) : null}

            {isOpen ? <EmojiPanel value={value} onPick={pick}/> : null}
        </div>
    );
}
