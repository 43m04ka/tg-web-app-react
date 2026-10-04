import React, {useMemo} from 'react';
import {catalogSummary, gameCatalog, russianText, sectionOfBenefit, thumb, tierInfoOf} from './contentsModel';
import style from './Subscription.module.scss';

const PREVIEW = 5;

export default function SubscriptionContents({info, tierName, onOpenGames}) {
    const tierInfo = useMemo(() => tierInfoOf(info, tierName), [info, tierName]);
    const entries = useMemo(() => gameCatalog(info), [info]);
    const summary = useMemo(() => catalogSummary(entries, tierInfo?.key), [entries, tierInfo]);

    const covers = useMemo(
        () => entries.filter((entry) => entry.game.image).slice(0, PREVIEW).map((entry) => entry.game.image),
        [entries]
    );

    if (!tierInfo && !entries.length) return null;

    const description = russianText(tierInfo?.description);
    const levels = (info?.tiers || []).length > 1;

    return (
        <section className={style.block}>
            <div className={style.blockHead}>
                <h2 className={style.blockTitle}>Что входит в {tierInfo?.name || info.name}</h2>
            </div>

            <div className={style.perksCard}>
                {description ? <p className={style.perksText}>{description}</p> : null}

                {tierInfo?.benefits?.length ? (
                    <div className={style.perks}>
                        {tierInfo.benefits.map((benefit) => {
                            const section = sectionOfBenefit(info, benefit);

                            return section ? (
                                <button
                                    key={benefit}
                                    type="button"
                                    className={`${style.perk} ${style.perkLink}`}
                                    onClick={() => onOpenGames(section)}
                                >
                                    <span className={style.perkMark} aria-hidden="true">✓</span>
                                    {benefit}
                                    <span className={style.perkArrow} aria-hidden="true">›</span>
                                </button>
                            ) : (
                                <span key={benefit} className={style.perk}>
                                    <span className={style.perkMark} aria-hidden="true">✓</span>
                                    {benefit}
                                </span>
                            );
                        })}
                    </div>
                ) : null}

                {info.note ? <p className={style.perksNote}>{info.note}</p> : null}
            </div>

            {entries.length ? (
                <button type="button" className={style.gamesTeaser} onClick={() => onOpenGames('all')}>
                    <span className={style.teaserCovers} aria-hidden="true">
                        {covers.map((image, index) => (
                            <span
                                key={image}
                                className={style.teaserCover}
                                style={{backgroundImage: `url(${thumb(image)})`, '--i': index}}
                            />
                        ))}
                    </span>
                    <span className={style.teaserText}>
                        <span className={style.teaserTitle}>Список игр подписки</span>
                        <span className={style.teaserNote}>
                            {levels
                                ? `${summary.included} игр входят в ${tierInfo?.name}${summary.excluded ? `, ещё ${summary.excluded} — в старших уровнях` : ''}`
                                : `${summary.total} игр — посмотреть, что входит`}
                        </span>
                    </span>
                    <span className={style.teaserArrow} aria-hidden="true">›</span>
                </button>
            ) : null}
        </section>
    );
}
