import React, {useEffect, useState} from 'react';
import style from './Maintenance.module.scss';

const formatRemaining = (until) => {
    if (!until) return null;

    const target = new Date(until).getTime();
    if (Number.isNaN(target)) return null;

    const diffMs = target - Date.now();
    if (diffMs <= 0) return null;

    const totalMinutes = Math.round(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const dateLabel = new Date(until).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });

    const parts = [];
    if (hours > 0) parts.push(`${hours} ч`);
    if (minutes > 0 || hours === 0) parts.push(`${minutes} мин`);

    return `Ожидаем завершения работ примерно к ${dateLabel} (осталось ~${parts.join(' ')})`;
};

export default function Maintenance({until}) {
    const [remaining, setRemaining] = useState(() => formatRemaining(until));

    useEffect(() => {
        setRemaining(formatRemaining(until));
        if (!until) return;

        const intervalId = setInterval(() => setRemaining(formatRemaining(until)), 30000);
        return () => clearInterval(intervalId);
    }, [until]);

    return (
        <div className={style.screen}>
            <div className={style.card}>
                <div className={style.badge}>Техническое обслуживание</div>

                <h1 className={style.title}>
                    Геймворд — сервис покупки игр и подписок для <span className={style.ps}>PlayStation</span> и{' '}
                    <span className={style.xbox}>Xbox</span>
                </h1>

                <p className={style.description}>
                    Прямо сейчас мы улучшаем систему, чтобы покупки обрабатывались ещё быстрее. Каталог станет доступен
                    в ближайшее время.
                </p>

                {remaining ? <div className={style.remaining}>{remaining}</div> : null}

                <a className={style.support} href="https://t.me" target="_blank" rel="noopener noreferrer">
                    <span className={style.supportTitle}>Поддержка магазина</span>
                    <span className={style.supportSub}>Решим любой возникший вопрос</span>
                </a>
            </div>
        </div>
    );
}
