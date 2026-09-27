import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import style from './SelectPlatform.module.scss';

const FIRST_HOLD_MS = 3200;
const BASE_HOLD_MS = 2400;
const PHRASE_HOLD_MS = 950;
const GAP_MS = 240;

const between = (min, max) => min + Math.random() * (max - min);

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function TypingHint({base, phrases}) {
    const [text, setText] = useState(base);
    const [isBusy, setIsBusy] = useState(false);
    const [overflow, setOverflow] = useState(0);
    const phrasesRef = useRef(phrases);
    const boxRef = useRef(null);
    const lineRef = useRef(null);

    phrasesRef.current = phrases;

    useEffect(() => {
        setText(base);
        if (prefersReducedMotion()) return undefined;

        let timerId = null;
        let isCancelled = false;
        let last = null;

        const wait = (ms) => new Promise((resolve) => {
            timerId = setTimeout(resolve, ms);
        });

        const erase = async (value) => {
            for (let length = value.length - 1; length >= 0; length -= 1) {
                await wait(between(24, 42));
                if (isCancelled) return;
                setText(value.slice(0, length));
            }
        };

        const type = async (value) => {
            for (let length = 1; length <= value.length; length += 1) {
                await wait(value[length - 2] === ' ' ? between(110, 170) : between(52, 105));
                if (isCancelled) return;
                setText(value.slice(0, length));
            }
        };

        const pick = () => {
            const pool = phrasesRef.current.filter((phrase) => phrase !== last);
            if (!pool.length) return null;
            return pool[Math.floor(Math.random() * pool.length)];
        };

        const run = async () => {
            let hold = FIRST_HOLD_MS;

            while (!isCancelled) {
                await wait(hold);
                if (isCancelled) return;
                hold = BASE_HOLD_MS;

                const phrase = pick();
                if (!phrase) continue;
                last = phrase;

                setIsBusy(true);
                await erase(base);
                await wait(GAP_MS);
                await type(phrase);
                if (isCancelled) return;
                setIsBusy(false);

                await wait(PHRASE_HOLD_MS);
                if (isCancelled) return;

                setIsBusy(true);
                await erase(phrase);
                await wait(GAP_MS);
                await type(base);
                if (isCancelled) return;
                setIsBusy(false);
            }
        };

        run();

        return () => {
            isCancelled = true;
            clearTimeout(timerId);
        };
    }, [base]);

    useLayoutEffect(() => {
        const box = boxRef.current;
        const line = lineRef.current;
        if (!box || !line) return;
        setOverflow(Math.max(line.scrollWidth - box.clientWidth, 0));
    }, [text]);

    return (
        <span ref={boxRef} className={`${style.typing} ${overflow > 0 ? style.typingClipped : ''}`}>
            <span
                ref={lineRef}
                className={style.typingLine}
                style={overflow > 0 ? {transform: `translateX(${-overflow}px)`} : undefined}
            >
                {text}
                <span className={`${style.caret} ${isBusy ? style.caretSolid : ''}`} aria-hidden="true"/>
            </span>
        </span>
    );
}
