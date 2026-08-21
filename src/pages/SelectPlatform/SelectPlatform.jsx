import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useStructureStore} from '../../store/useStructureStore';
import {useSessionStore} from '../../store/useSessionStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {getTelegramObject} from '../../shared/lib/telegram';
import {glowStyle} from './accent';
import PlatformCard from './PlatformCard';
import PlatformLink from './PlatformLink';
import style from './SelectPlatform.module.scss';

const STAGGER_MS = 22;
const STAGGER_CAP_MS = 170;
const LEAVE_MS = 240;
const ENTER_MS = 210;

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
    const {safeAreaInset, contentSafeAreaInset} = useAppInsets();

    const startPages = useStructureStore((state) => state.startPages);
    const pages = useStructureStore((state) => state.pages);
    const pageId = useSessionStore((state) => state.pageId);
    const setPageId = useSessionStore((state) => state.setPageId);

    const [pickedId, setPickedId] = useState(null);
    const [isEntering, setIsEntering] = useState(true);

    useEffect(() => {
        getTelegramObject().BackButton?.hide();
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => setIsEntering(false), STAGGER_CAP_MS + ENTER_MS + 120);
        return () => clearTimeout(timerId);
    }, []);

    const activeGlow = useMemo(() => {
        if (!Array.isArray(startPages)) return {};

        const active = startPages.find((item) =>
            pickedId !== null ? item.id === pickedId : item.structurePageId === pageId
        );

        return active ? glowStyle(active.color) : {};
    }, [startPages, pickedId, pageId]);

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
    const revealProps = () => {
        const delay = Math.min(order++ * STAGGER_MS, STAGGER_CAP_MS);
        return isEntering ? {style: {animationDelay: `${delay}ms`}} : {};
    };

    const renderChild = (item) => {
        const isPicked = pickedId === item.id;
        const className = [
            style.item,
            isEntering ? style.entering : '',
            isPicked ? style.picked : ''
        ].join(' ');

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
            <div key={item.id} className={className} {...revealProps()}>
                {content}
            </div>
        );
    };

    return (
        <div
            className={`${style.screen} ${pickedId !== null ? style.leaving : ''}`}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${safeAreaInset.bottom}px + 32 * var(--u))`
            }}
        >
            <div
                className={`${style.glow} ${activeGlow.backgroundColor ? style.glowVisible : ''}`}
                style={activeGlow}
                aria-hidden="true"
            />

            {contentSafeAreaInset.top > 0 ? (
                <>
                    <div
                        className={style.topSolid}
                        style={{height: `${safeAreaInset.top}px`}}
                        aria-hidden="true"
                    />
                    <div
                        className={style.topFade}
                        style={{
                            top: `${safeAreaInset.top}px`,
                            height: `${Math.max(contentSafeAreaInset.top - safeAreaInset.top, 1)}px`
                        }}
                        aria-hidden="true"
                    />
                </>
            ) : null}

            <h1 className={style.title}>
                Ваш сервис для покупки игр и подписок для <span className={style.ps}>PlayStation</span> и{' '}
                <span className={style.xbox}>Xbox</span>
            </h1>

            {groups.map((group) => (
                <section key={group.key} className={style.group}>
                    {group.header ? (
                        <div className={`${style.item} ${isEntering ? style.entering : ''}`} {...revealProps()}>
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
