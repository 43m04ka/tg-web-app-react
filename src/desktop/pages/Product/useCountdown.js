import {useEffect, useState} from 'react';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const pad = (value) => String(value).padStart(2, '0');

export const countdownParts = (left) => {
    if (!(left > 0)) return null;

    const days = Math.floor(left / DAY);
    const hours = Math.floor((left % DAY) / HOUR);
    const minutes = Math.floor((left % HOUR) / MINUTE);

    if (days > 0) return `${days} дн ${hours} ч ${pad(minutes)} мин`;
    if (hours > 0) return `${hours} ч ${pad(minutes)} мин`;
    return `${Math.max(1, minutes)} мин`;
};

export function useCountdown(endDate) {
    const end = endDate ? endDate.getTime() : null;
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (end === null) return undefined;

        setNow(Date.now());
        const timerId = setInterval(() => setNow(Date.now()), 15 * 1000);
        return () => clearInterval(timerId);
    }, [end]);

    if (end === null) return null;

    const left = end - now;
    return {label: countdownParts(left), isUrgent: left > 0 && left < DAY};
}
