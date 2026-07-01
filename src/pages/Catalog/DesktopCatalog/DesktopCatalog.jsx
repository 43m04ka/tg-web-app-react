import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../../hooks/useTelegram';
import useGlobalData from '../../../hooks/useGlobalData';
import { useServerUser } from '../../../hooks/useServerUser';
import CatalogItem from '../CatalogItem';
import Sorting from '../../../shared/ui/Filter/Sorting';
import Filter from '../../../shared/ui/Filter/Filter';
import style from './DesktopCatalog.module.scss';

let dt_lastScroll = 0;
let dt_listNumber = 1;
let dt_lastCardList = null;
let dt_lastPath = '';
let dt_len = 1;
let dt_onLoad = false;
let dt_lastJson = { sorting: 'default', platform: [], language: [], numberPlayers: [], genre: [], type: [] };

const DesktopCatalog = () => {
    const navigate = useNavigate();
    const { tg, isTg } = useTelegram(); // isTg used for share URL
    const { catalogList, catalogStructureList, setBufferCardsCatalog } = useGlobalData();
    const { getCardList } = useServerUser();

    const [sortWindowOpen, setSortWindowOpen] = useState(false);
    const [filterWindowOpen, setFilterWindowOpen] = useState(false);
    const [json, setJson] = useState(dt_lastJson);
    const [icon, setIcon] = useState(null);
    const [cardList, setCardList] = useState(dt_lastCardList);
    const [copied, setCopied] = useState(false);
    const scrollRef = useRef();

    const setNewCardData = (data, number) => {
        const merged = [...(cardList || []), ...data.cardList];
        setCardList(merged);
        setBufferCardsCatalog(merged);
        dt_lastCardList = merged;
        dt_listNumber = number;
        dt_len = data.len;
        dt_onLoad = false;
        dt_lastJson = json;
    };

    const catalog = catalogList.map(c => {
        if (c.path === window.location.pathname.replace('/catalog/', '')) {
            if (dt_lastPath !== c.path) {
                dt_lastPath = c.path;
                setCardList(null);
                dt_lastScroll = 0;
                dt_lastCardList = null;
                dt_lastJson = { sorting: 'default', platform: [], language: [], numberPlayers: [], genre: [], type: [] };
            }
            return c;
        }
        return null;
    }).filter(Boolean)[0] || null;

    useEffect(() => {
        tg.BackButton.show();
        try {
            scrollRef.current?.scrollTo({ top: dt_lastScroll, behavior: 'instant' });
        } catch (e) {}
        const onBack = () => navigate(-1);
        tg.onEvent('backButtonClicked', onBack);
        return () => tg.offEvent('backButtonClicked', onBack);
    }, [navigate, tg]);

    const onClose = () => {
        setFilterWindowOpen(false);
        setSortWindowOpen(false);
        setCardList(null);
        dt_lastScroll = 0;
        dt_lastCardList = null;
    };

    const catalogName = catalogStructureList
        .filter(c => c.path === dt_lastPath && c.name)
        .map(c => c.name)[0] || '';

    const catalogPath = catalog?.path || dt_lastPath;

    const onShare = async () => {
        const url = isTg
            ? `https://t.me/gwstore_bot/app?startapp=catalog_${catalogPath}`
            : `${window.location.origin}?startapp=catalog_${catalogPath}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('soft');
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {}
    };

    if (catalog === null) return null;

    if (cardList === null) {
        getCardList(setNewCardData, catalog.id, 1, json).then();
        return (
            <div className={style.page}>
                <div className={style.loaderWrap}>
                    <div className={style.circle} />
                    <div className={style.circle} />
                    <div className={style.circle} />
                    <div className={style.shadow} />
                    <div className={style.shadow} />
                    <div className={style.shadow} />
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className={style.page}
                ref={scrollRef}
                onScroll={(event) => {
                    dt_lastScroll = event.target.scrollTop;
                    if (
                        dt_listNumber < dt_len &&
                        event.target.scrollTop + 2000 > scrollRef.current.scrollHeight &&
                        !dt_onLoad
                    ) {
                        dt_onLoad = true;
                        getCardList(setNewCardData, catalog.id, dt_listNumber + 1, json).then();
                    }
                }}
            >
                <div className={style.inner}>
                    <div className={style.header}>
                        <h1 className={style.title}>{catalogName}</h1>
                        <div className={style.headerActions}>
                            <button className={style.filterBtn} onClick={() => setSortWindowOpen(true)}>
                                {json.sorting !== 'default' && <span className={style.activeDot} />}
                                Сортировка
                            </button>
                            <button className={style.filterBtn} onClick={() => setFilterWindowOpen(true)}>
                                {(json.platform.length + json.language.length + json.numberPlayers.length > 0) && (
                                    <span className={style.activeDot} />
                                )}
                                Фильтры
                            </button>
                            <button
                                className={`${style.shareBtn} ${copied ? style.shareBtnCopied : ''}`}
                                onClick={onShare}
                            >
                                {copied ? 'Ссылка скопирована!' : 'Поделиться каталогом'}
                            </button>
                        </div>
                    </div>

                    <div className={style.grid}>
                        {cardList.map(item => (
                            <CatalogItem key={item.id} product={item} embedInGrid />
                        ))}
                    </div>

                    {cardList.length === 0 && (
                        <p className={style.emptyMsg}>Ничего не найдено, попробуйте изменить фильтры</p>
                    )}
                </div>
            </div>

            {/* Rendered outside .page so overflow-y:auto doesn't clip the modal */}
            {sortWindowOpen && (
                <Sorting onClose={onClose} json={json} setJson={setJson} setIcon={setIcon} />
            )}
            {filterWindowOpen && (
                <Filter onClose={onClose} json={json} setJson={setJson} />
            )}
        </>
    );
};

export default DesktopCatalog;
