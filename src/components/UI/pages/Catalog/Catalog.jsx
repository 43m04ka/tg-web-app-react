import React, {useEffect, useRef, useState} from 'react';
import '../../../styles/style.css';
import {useTelegram} from "../../../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";
import useGlobalData from "../../../../hooks/useGlobalData";
import {useServerUser} from "../../../../hooks/useServerUser";
import CatalogItem from "./CatalogItem";
import style from './Catalog.module.scss'

let lastScroll = 0
let scrollCtrl = 0
let listNumber = 1
let lastCardList = null
let lastPath = ''
let len = 1
let onLoad = false

const Catalog = () => {

    const navigate = useNavigate();
    const {tg} = useTelegram()
    const {catalogList, catalogStructureList} = useGlobalData()
    const {getCardList} = useServerUser()
    const [height, setHeight] = useState(0);

    const [cardList, setCardList] = useState(lastCardList)
    const scrollRef = useRef();

    const setNewCardData = (data, number) => {
        setCardList([...(cardList || []), ...data.cardList])
        lastCardList = [...(cardList || []), ...data.cardList]
        listNumber = number
        len = data.len
        onLoad = false;
    }

    useEffect(() => {
        if (window.innerHeight > height) {
            setTimeout(() => {
                setHeight(window.innerHeight)
            }, 50)

        }
    }, [window.innerHeight])

    let catalog = catalogList.map(catalog => {
        if (catalog.path === (window.location.pathname).replace('/catalog/', '')) {
            if (lastPath !== catalog.path) {
                lastPath = catalog.path
                setCardList(null)
                lastScroll = 0
                lastCardList = null
            }
            return catalog
        } else {
            return null
        }
    }).filter(item => item !== null)[0] || null

    useEffect(() => {
        tg.BackButton.show();
        try {
            scrollRef.current.scrollTo({
                top: lastScroll, behavior: "instant",
            });
        } catch (e) {
        }

        tg.onEvent('backButtonClicked', () => navigate(-1))
        return () => {
            tg.offEvent('backButtonClicked', () => navigate(-1))
        }
    }, [scrollRef])

    if (catalog !== null) {
        if (cardList !== null) {
            return (<div className={style['mainDivision']}>
                <div className={'scroll-container-y'} ref={scrollRef}
                     onScroll={async (event) => {
                         lastScroll = event.target.scrollTop
                         if (listNumber < len && event.target.scrollTop + 2000 > scrollRef.current.scrollHeight && !onLoad) {
                             onLoad = true
                             getCardList(setNewCardData, catalog.id, listNumber + 1).then()
                         }
                     }}
                     style={{
                         paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px',
                         paddingBottom: String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom + 0.03 * window.innerWidth) + 'px',
                         height: '100vh',
                     }}>
                    <div className={style['title']}>
                        {catalogStructureList.map(catalog => {
                            if (catalog.path === lastPath && typeof catalog.name !== 'undefined') {
                                return catalog.name
                            }
                        })}
                    </div>
                    <div className={'list-grid'}>
                        {cardList.map(item => (
                            <div style={{marginLeft: '6vw'}}>
                                <CatalogItem key={item.id} product={item}/></div>))}
                    </div>
                </div>
            </div>);
        } else {
            getCardList(setNewCardData, catalog.id, 1).then()
            return (<div className={'plup-loader'} style={{
                marginTop: '10px', marginLeft: String(window.innerWidth / 2 - 50) + 'px'
            }}></div>)
        }
    }
};

export default Catalog;
