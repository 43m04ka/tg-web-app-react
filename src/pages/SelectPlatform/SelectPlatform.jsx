import React, {useCallback, useEffect, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {useStructureStore} from '../../store/useStructureStore';
import {useSessionStore} from '../../store/useSessionStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {getTelegramObject} from '../../shared/lib/telegram';
import PlatformCard from './PlatformCard';
import PlatformLink from './PlatformLink';
import SectionHeader from './SectionHeader';
import style from './SelectPlatform.module.scss';

const SELECT_DELAY_MS = 260;

export default function SelectPlatform() {
    const navigate = useNavigate();
    const {botType} = usePlatform();
    const {safeAreaInset} = useAppInsets();

    const startPages = useStructureStore((state) => state.startPages);
    const pages = useStructureStore((state) => state.pages);
    const pageId = useSessionStore((state) => state.pageId);
    const setPageId = useSessionStore((state) => state.setPageId);

    useEffect(() => {
        getTelegramObject().BackButton?.hide();
    }, []);

    const items = useMemo(() => {
        if (!Array.isArray(startPages)) return [];
        return [...startPages]
            .filter((item) => item.platform === botType)
            .sort((a, b) => a.serialNumber - b.serialNumber);
    }, [startPages, botType]);

    const handleSelect = useCallback((item) => {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
        setPageId(item.structurePageId);
        setTimeout(() => navigate('/main'), SELECT_DELAY_MS);
    }, [navigate, setPageId]);

    return (
        <div
            className={style.screen}
            style={{paddingTop: safeAreaInset.top + 44, paddingBottom: safeAreaInset.bottom + 32}}
        >
            <div className={style.glowTop} aria-hidden="true"/>
            <div className={style.glowSide} aria-hidden="true"/>

            <h1 className={style.title}>
                Ваш сервис для покупки игр и подписок для <span className={style.ps}>PlayStation</span> и{' '}
                <span className={style.xbox}>Xbox</span>
            </h1>

            <div className={style.stack}>
                {items.map((item, index) => {
                    if (item.type === 'page') {
                        const page = pages?.find((candidate) => candidate.id === item.structurePageId);
                        if (!page) return null;

                        return (
                            <PlatformCard
                                key={item.id}
                                item={{...page, ...item}}
                                isActive={item.structurePageId === pageId}
                                delay={index * 60}
                                onSelect={() => handleSelect(item)}
                            />
                        );
                    }

                    if (item.type === 'link') {
                        return <PlatformLink key={item.id} item={item} delay={index * 60}/>;
                    }

                    return <SectionHeader key={item.id} item={item}/>;
                })}
            </div>
        </div>
    );
}
