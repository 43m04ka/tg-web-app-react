import React, {useEffect, useMemo, useState} from 'react';
import {formatDay} from '../../shared/lib/membership';
import {catalogSummary, filterCatalog, gameCatalog, isIncluded, thumb, tierInfoOf} from './contentsModel';
import style from './SubscriptionGames.module.scss';

const STEP = 40;

const shortTier = (name) => String(name || '').replace(/^PS Plus\s+/i, '');

export default function SubscriptionGames({info, tierName, initialSection = 'all', onOpenProduct, onBack}) {
    const tiers = info?.tiers || [];
    const startTier = tierInfoOf(info, tierName)?.key || tiers[0]?.key || null;

    const [tierKey, setTierKey] = useState(startTier);
    const [status, setStatus] = useState('all');
    const [section, setSection] = useState(initialSection);
    const [query, setQuery] = useState('');
    const [limit, setLimit] = useState(STEP);

    const entries = useMemo(() => gameCatalog(info), [info]);
    const summary = useMemo(() => catalogSummary(entries, tierKey), [entries, tierKey]);
    const sections = useMemo(() => (info?.sections || []).filter((item) => item.games?.length), [info]);

    const shown = useMemo(
        () => filterCatalog(entries, {tierKey, status, section, query}),
        [entries, tierKey, status, section, query]
    );

    useEffect(() => {
        setLimit(STEP);
    }, [tierKey, status, section, query]);

    const activeName = tiers.find((item) => item.key === tierKey)?.name || info?.name;
    const hasLevels = tiers.length > 1;

    return (
        <section className={style.games}>
            <div className={style.head}>
                {onBack ? (
                    <button type="button" className={style.back} onClick={onBack}>
                        <span aria-hidden="true">‹</span> К подписке
                    </button>
                ) : null}
                <h2 className={style.title}>Игры {info?.name}</h2>
                <p className={style.lead}>
                    {hasLevels
                        ? `В ${activeName} входит ${summary.included} из ${summary.total} игр`
                        : `${summary.total} игр в подписке`}
                </p>
            </div>

            {hasLevels ? (
                <div className={style.levels} role="tablist">
                    {tiers.map((tier) => (
                        <button
                            key={tier.key}
                            type="button"
                            role="tab"
                            aria-selected={tier.key === tierKey}
                            className={tier.key === tierKey ? `${style.level} ${style.levelOn}` : style.level}
                            onClick={() => setTierKey(tier.key)}
                        >
                            {shortTier(tier.name)}
                        </button>
                    ))}
                </div>
            ) : null}

            <div className={style.filters}>
                {hasLevels ? (
                    <>
                        <button type="button" className={status === 'all' ? `${style.chip} ${style.chipOn}` : style.chip} onClick={() => setStatus('all')}>
                            Все <b>{summary.total}</b>
                        </button>
                        <button type="button" className={status === 'in' ? `${style.chip} ${style.chipOn}` : style.chip} onClick={() => setStatus('in')}>
                            Входят <b>{summary.included}</b>
                        </button>
                        <button type="button" className={status === 'out' ? `${style.chip} ${style.chipOn}` : style.chip} onClick={() => setStatus('out')}>
                            Не входят <b>{summary.excluded}</b>
                        </button>
                        <span className={style.divider} aria-hidden="true"/>
                    </>
                ) : null}

                <button type="button" className={section === 'all' ? `${style.chip} ${style.chipOn}` : style.chip} onClick={() => setSection('all')}>
                    Все разделы
                </button>
                {sections.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={section === item.key ? `${style.chip} ${style.chipOn}` : style.chip}
                        onClick={() => setSection(item.key)}
                    >
                        {item.title} <b>{item.games.length}</b>
                    </button>
                ))}
            </div>

            <input
                className={style.search}
                type="search"
                value={query}
                placeholder="Найти игру"
                onChange={(event) => setQuery(event.target.value)}
            />

            {shown.length ? (
                <div className={style.list}>
                    {shown.slice(0, limit).map((entry, index) => {
                        const {game} = entry;
                        const included = isIncluded(entry, tierKey);
                        const until = game.availableUntil ? formatDay(game.availableUntil) : null;
                        const canOpen = Boolean(game.siteProductId && onOpenProduct);
                        const where = entry.sections.map((item) => item.title).join(' · ');

                        return (
                            <button
                                key={`${game.productId || game.name}-${index}`}
                                type="button"
                                className={canOpen ? `${style.row} ${style.rowLink}` : style.row}
                                onClick={canOpen ? () => onOpenProduct(game.siteProductId) : undefined}
                                disabled={!canOpen}
                            >
                                <span
                                    className={style.cover}
                                    style={game.image ? {backgroundImage: `url(${thumb(game.image)})`} : undefined}
                                />
                                <span className={style.text}>
                                    <span className={style.name}>{game.name}</span>
                                    <span className={style.where}>
                                        {where}
                                        {until ? <span className={style.until}> · до {until}</span> : null}
                                    </span>
                                </span>
                                {hasLevels ? (
                                    <span className={included ? `${style.status} ${style.statusIn}` : `${style.status} ${style.statusOut}`}>
                                        {included ? '✓ Входит' : `Только ${shortTier(entry.minTierName)}`}
                                    </span>
                                ) : (
                                    <span className={`${style.status} ${style.statusIn}`}>✓ Входит</span>
                                )}
                                <span className={style.chevron} aria-hidden="true">{canOpen ? '›' : ''}</span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <p className={style.empty}>Ничего не нашлось</p>
            )}

            {shown.length > limit ? (
                <button type="button" className={style.more} onClick={() => setLimit((value) => value + STEP)}>
                    Показать ещё · {shown.length - limit}
                </button>
            ) : null}
        </section>
    );
}
