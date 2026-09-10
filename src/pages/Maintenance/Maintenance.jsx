import React, {useEffect, useState} from 'react';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {remainingOf} from '../../shared/lib/maintenance';
import {supportUrlForBot} from '../More/moreMenu';
import style from './Maintenance.module.scss';

const TICK_MS = 30000;

function SupportIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M4 11a8 8 0 0 1 16 0v5a3 3 0 0 1-3 3h-2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <rect x="2.5" y="10.5" width="4" height="6.5" rx="2" fill="currentColor"/>
            <rect x="17.5" y="10.5" width="4" height="6.5" rx="2" fill="currentColor"/>
        </svg>
    );
}

export default function Maintenance({until, section}) {
    const {botType} = usePlatform();
    const supportUrl = supportUrlForBot(botType);

    const [remaining, setRemaining] = useState(() => remainingOf(until));

    useEffect(() => {
        setRemaining(remainingOf(until));
        if (!until) return undefined;

        const timerId = setInterval(() => setRemaining(remainingOf(until)), TICK_MS);
        return () => clearInterval(timerId);
    }, [until]);

    return (
        <div className={`${style.screen} ${section ? style.inline : ''}`}>
            <div className={style.body}>
                <span className={style.badge}>
                    <span className={style.pulse} aria-hidden="true"/>
                    Технические работы
                </span>

                {section ? (
                    <>
                        <h1 className={style.title}>
                            {section} <span className={style.soft}>временно недоступны</span>
                        </h1>

                        <p className={style.text}>
                            Чиним этот раздел. Остальной магазин работает как обычно — вернитесь на главную
                            или загляните сюда чуть позже.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className={style.title}>
                            Геймворд — игры и подписки для <span className={style.ps}>PlayStation</span> и{' '}
                            <span className={style.xbox}>Xbox</span>
                        </h1>

                        <p className={style.text}>
                            Прямо сейчас улучшаем систему, чтобы покупки обрабатывались ещё быстрее.
                            Каталог станет доступен в ближайшее время.
                        </p>
                    </>
                )}

                {remaining ? (
                    <div className={style.until}>
                        <span className={style.untilLabel}>Рассчитываем закончить</span>
                        <span className={style.untilValue}>{remaining.at}</span>
                        <span className={style.untilLeft}>осталось ~{remaining.left}</span>
                    </div>
                ) : null}

                {supportUrl ? (
                    <a className={style.support} href={supportUrl} target="_blank" rel="noopener noreferrer">
                        <span className={style.supportIcon}><SupportIcon/></span>

                        <span className={style.supportBody}>
                            <span className={style.supportTitle}>Поддержка магазина</span>
                            <span className={style.supportSub}>Решим любой возникший вопрос</span>
                        </span>

                        <span className={style.supportArrow} aria-hidden="true">›</span>
                    </a>
                ) : null}
            </div>
        </div>
    );
}
