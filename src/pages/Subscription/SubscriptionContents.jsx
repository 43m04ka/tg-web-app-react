import React, {useEffect, useMemo, useState} from 'react';
import {formatDay} from '../../shared/lib/membership';
import {matchesQuery, russianText, sectionsFor, thumb, tierInfoOf} from './contentsModel';
import style from './Subscription.module.scss';

const STEP = 18;
const SEARCH_FROM = 30;

export default function SubscriptionContents({info, tierName, onOpenProduct}) {
    const tierInfo = useMemo(() => tierInfoOf(info, tierName), [info, tierName]);
    const sections = useMemo(() => sectionsFor(info, tierInfo?.key), [info, tierInfo]);

    const [activeKey, setActiveKey] = useState(null);
    const [limit, setLimit] = useState(STEP);
    const [query, setQuery] = useState('');

    const active = sections.find((section) => section.key === activeKey) || sections[0] || null;

    useEffect(() => {
        setLimit(STEP);
        setQuery('');
    }, [active?.key]);

    const games = useMemo(
        () => (active ? active.games.filter((game) => matchesQuery(game, query)) : []),
        [active, query]
    );

    if (!tierInfo && !sections.length) return null;

    const description = russianText(tierInfo?.description);

    return (
        <>
            {tierInfo?.benefits?.length ? (
                <section className={style.block}>
                    <div className={style.blockHead}>
                        <h2 className={style.blockTitle}>Что входит в {tierInfo.name}</h2>
                    </div>

                    <div className={style.perksCard}>
                        {description ? <p className={style.perksText}>{description}</p> : null}

                        <div className={style.perks}>
                            {tierInfo.benefits.map((benefit) => (
                                <span key={benefit} className={style.perk}>
                                    <span className={style.perkMark} aria-hidden="true">✓</span>
                                    {benefit}
                                </span>
                            ))}
                        </div>

                        {info.note ? <p className={style.perksNote}>{info.note}</p> : null}
                    </div>
                </section>
            ) : null}

            {active ? (
                <section className={style.block}>
                    <div className={style.blockHead}>
                        <h2 className={style.blockTitle}>Игры в подписке</h2>
                        {info.collectedAt ? (
                            <span className={style.blockNote}>обновлено {formatDay(info.collectedAt)}</span>
                        ) : null}
                    </div>

                    <div className={style.gameTabs} role="tablist">
                        {sections.map((section) => (
                            <button
                                key={section.key}
                                type="button"
                                role="tab"
                                aria-selected={section.key === active.key}
                                className={section.key === active.key ? `${style.gameTab} ${style.gameTabActive}` : style.gameTab}
                                onClick={() => setActiveKey(section.key)}
                            >
                                {section.title}
                                <span className={style.gameTabCount}>{section.games.length}</span>
                            </button>
                        ))}
                    </div>

                    {active.games.length > SEARCH_FROM ? (
                        <input
                            className={style.gameSearch}
                            type="search"
                            value={query}
                            placeholder={`Найти среди ${active.games.length} игр`}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    ) : null}

                    {games.length ? (
                        <div className={style.games}>
                            {games.slice(0, limit).map((game, index) => {
                                const until = game.availableUntil ? formatDay(game.availableUntil) : null;
                                const canOpen = Boolean(game.siteProductId && onOpenProduct);

                                return (
                                    <button
                                        key={`${game.productId || game.name}-${index}`}
                                        type="button"
                                        className={canOpen ? `${style.game} ${style.gameLink}` : style.game}
                                        onClick={canOpen ? () => onOpenProduct(game.siteProductId) : undefined}
                                        disabled={!canOpen}
                                        style={{'--i': index % STEP}}
                                    >
                                        <span
                                            className={style.gameCover}
                                            style={game.image ? {backgroundImage: `url(${thumb(game.image)})`} : undefined}
                                        >
                                            {until ? <span className={style.gameUntil}>до {until}</span> : null}
                                        </span>
                                        <span className={style.gameName}>{game.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className={style.gamesEmpty}>Ничего не нашлось</p>
                    )}

                    {games.length > limit ? (
                        <button type="button" className={style.gamesMore} onClick={() => setLimit((value) => value + STEP * 2)}>
                            Показать ещё · {games.length - limit}
                        </button>
                    ) : null}
                </section>
            ) : null}
        </>
    );
}
