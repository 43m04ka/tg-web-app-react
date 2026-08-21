import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useStructureStore} from '../../store/useStructureStore';
import {useSessionStore} from '../../store/useSessionStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {getTelegramObject} from '../../shared/lib/telegram';
import PlatformCard from './PlatformCard';
import PlatformLink from './PlatformLink';
import style from './SelectPlatform.module.scss';

const STAGGER_MS = 55;
const STAGGER_CAP_MS = 520;
const LEAVE_MS = 340;

const toGroups = (items) => {
    const groups = [];
    let current = null;

    items.forEach((item) => {
        if (item.type === 'title' || !current) {
            current = {header: item.type === 'title' ? item : null, key: item.id, children: []};
            groups.push(current);
            if (item.type === 'title') return;
        }
        current.children.push(item);
    });

    return groups;
};

export default function SelectPlatform() {
    const navigate = useNavigate();
    const {botType} = usePlatform();
    const {safeAreaInset} = useAppInsets();

    const startPages = useStructureStore((state) => state.startPages);
    const pages = useStructureStore((state) => state.pages);
    const pageId = useSessionStore((state) => state.pageId);
    const setPageId = useSessionStore((state) => state.setPageId);

    const [pickedId, setPickedId] = useState(null);

    useEffect(() => {
        getTelegramObject().BackButton?.hide();
    }, []);

    const groups = useMemo(() => {
        if (!Array.isArray(startPages)) return [];

        const visible = [...startPages]
            .filter((item) => item.platform === botType)
            .sort((a, b) => a.serialNumber - b.serialNumber);

        return toGroups(visible);
    }, [startPages, botType]);

    const handleSelect = useCallback((item) => {
        if (pickedId !== null) return;

        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
        setPickedId(item.id);
        setPageId(item.structurePageId);
        setTimeout(() => navigate('/main'), LEAVE_MS);
    }, [navigate, pickedId, setPageId]);

    let order = 0;
    const nextDelay = () => Math.min(order++ * STAGGER_MS, STAGGER_CAP_MS);

    const renderChild = (item) => {
        const isPicked = pickedId === item.id;
        const isDimmed = pickedId !== null && !isPicked;
        const className = [style.reveal, isPicked ? style.picked : '', isDimmed ? style.dimmed : ''].join(' ');

        let content;

        if (item.type === 'page') {
            const page = pages?.find((candidate) => candidate.id === item.structurePageId);
            if (!page) return null;

            content = (
                <PlatformCard
                    item={{...page, ...item}}
                    isActive={isPicked || item.structurePageId === pageId}
                    onSelect={() => handleSelect(item)}
                />
            );
        } else if (item.type === 'link') {
            content = <PlatformLink item={item}/>;
        } else {
            content = <p className={style.hint}>{item.text}</p>;
        }

        return (
            <div key={item.id} className={className} style={{animationDelay: `${nextDelay()}ms`}}>
                {content}
            </div>
        );
    };

    return (
        <div
            className={`${style.screen} ${pickedId !== null ? style.leaving : ''}`}
            style={{
                paddingTop: `calc(${safeAreaInset.top}px + 44 * var(--u))`,
                paddingBottom: `calc(${safeAreaInset.bottom}px + 32 * var(--u))`
            }}
        >
            <h1 className={style.title}>
                Ваш сервис для покупки игр и подписок для <span className={style.ps}>PlayStation</span> и{' '}
                <span className={style.xbox}>Xbox</span>
            </h1>

            {groups.map((group) => (
                <section key={group.key} className={style.group}>
                    {group.header ? (
                        <div className={style.reveal} style={{animationDelay: `${nextDelay()}ms`}}>
                            <div className={style.sectionHeader}>
                                {group.header.icon ? (
                                    <span
                                        className={style.sectionIcon}
                                        style={{backgroundImage: `url(${group.header.icon})`}}
                                        aria-hidden="true"
                                    />
                                ) : null}
                                <span className={style.sectionTitle}>{group.header.text}</span>
                            </div>
                        </div>
                    ) : null}

                    {group.children.map(renderChild)}
                </section>
            ))}
        </div>
    );
}
