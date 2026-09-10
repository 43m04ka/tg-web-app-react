import React, {useMemo} from 'react';
import PlatformCard from '../../../SelectPlatform/PlatformCard';
import PlatformLink from '../../../SelectPlatform/PlatformLink';
import PopularRail from '../../../SelectPlatform/PopularRail';
import client from '../../../SelectPlatform/SelectPlatform.module.scss';
import {toGroups} from './startModel';
import style from './StorefrontScreen.module.scss';

const noop = () => undefined;

function StartItem({item, isTile, pages}) {
    const className = `${client.item} ${isTile && item.type === 'page' ? '' : client.itemWide}`;

    if (item.type === 'page') {
        const page = (pages || []).find((candidate) => candidate.id === item.structurePageId);
        if (!page) return null;

        return (
            <div className={className}>
                <PlatformCard item={{...page, ...item}} isActive={false} isTile={isTile} onSelect={noop}/>
            </div>
        );
    }

    return (
        <div className={className}>
            {item.type === 'link' ? <PlatformLink item={item}/> : <p className={client.hint}>{item.text}</p>}
        </div>
    );
}

export default function StartPreview({rows, pages, popular}) {
    const groups = useMemo(() => toGroups(rows), [rows]);

    return (
        <div className={style.phone}>
            <div className={`${style.phoneScreen} ${style.startScreen}`}>
                <div className={client.screen} style={{paddingTop: 'calc(14 * var(--u))', paddingBottom: 'calc(32 * var(--u))'}}>
                    <h1 className={client.title}>
                        Геймворд — игры и подписки для <span className={client.ps}>PlayStation</span> и{' '}
                        <span className={client.xbox}>Xbox</span>
                    </h1>

                    <div className={client.search}>
                        <span className={client.searchIcon} aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="10.6" cy="10.6" r="6.7" stroke="currentColor" strokeWidth="2"/>
                                <path d="m15.6 15.6 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </span>
                        <span className={client.searchTitle}>Поиск по всем витринам</span>
                    </div>

                    <PopularRail items={popular} regionOf={() => null} onOpen={noop}/>

                    {groups.map((group) => {
                        const isGrid = group.children.filter((item) => item.type === 'page').length > 1;

                        return (
                            <section key={group.key} className={`${client.group} ${isGrid ? client.groupGrid : ''}`}>
                                {group.header ? (
                                    <div className={`${client.item} ${client.itemWide}`}>
                                        <div className={client.sectionHeader}>
                                            {group.header.icon ? (
                                                <span
                                                    className={client.sectionIcon}
                                                    style={{backgroundImage: `url(${group.header.icon})`}}
                                                    aria-hidden="true"
                                                />
                                            ) : null}
                                            <span className={client.sectionTitle}>{group.header.text}</span>
                                        </div>
                                    </div>
                                ) : null}

                                {group.children.map((item) => (
                                    <StartItem key={item.id} item={item} isTile={isGrid} pages={pages}/>
                                ))}
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
