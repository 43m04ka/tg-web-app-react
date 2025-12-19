import React, {useEffect, useRef, useState} from 'react';
import '../../../styles/style.css';
import {useTelegram} from "../../../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";
import useGlobalData from "../../../../hooks/useGlobalData";
import {useServerUser} from "../../../../hooks/useServerUser";
import CatalogItem from "./CatalogItem";
import style from './Catalog.module.scss'
import Sorting from "../../Elements/Filter/Sorting";
import Filter from "../../Elements/Filter/Filter";

let lastScroll = 0
let scrollCtrl = 0
let listNumber = 1
let lastCardList = null
let lastPath = ''
let len = 1
let onLoad = false
let lastJson = {sorting: 'default', platform: [], language: [], numberPlayers: []}

const Catalog = () => {

    const navigate = useNavigate();
    const {tg} = useTelegram()
    const {catalogList, catalogStructureList} = useGlobalData()
    const {getCardList} = useServerUser()
    const [height, setHeight] = useState(0);

    const [sortWindowOpen, setSortWindowOpen] = useState(false);
    const [filterWindowOpen, setFilterWindowOpen] = useState(false);
    const [json, setJson] = useState(lastJson);

    const [icon, setIcon] = useState('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAACjUlEQVR4nO3dR24UQRSH8bciCAEmR2PSFRBwJ0AI7mLBCZAQG4JkjmDA5OBAnDmDkYDNh0qalkwS4GlPvffq/5N65U2Xv03PTNVrMxEREREREREREZkI4DxwdXSdq30/zQJ2Avf41d3yt9r312KMef7sMbC79n02AZgCHvB3T4A9te83Nf49hqJMKMZD/t9TRekZsAt4tI4Ya6Psrb2OFBg/RueZoowJ2Ac8pz9vgIO11xU5xoseYyjKegH7NyhGZxE4VHudkWK83MAYiuIwRmcJOFx73S4BB4BXTJ6iOIrRWVaUH2O8pr5l4Ii1rDx+OonRWWk2CnAUeIs/H4Hj1hJg2mmM9qKMYrzDv0/ACcsMOBYkRv4ooxjviWcAnLRMAsdYG+WUZQDMAB+Ibxg+SqIY8aOUx8bR42M2Q+C0BfzWttx4VsOyRosCuEV+Ny0CYAfwjfy+AtvNu/LMTjtmzDtgE7BKfp+BzRYBcI38Zi3xHtxo5sMdeQC2AheBOWAhyTUHXAC21P7/ioiIiIiIRPlgeBm47+AD3UJPV1nLpbI2a/RcoFfla6EpiwK4Tn6zFkFDX7+vlrWad2WnH+2YNu/Kz5qjnzez+wJsswjKBgDyu2FRNLANaFDO0VskCXctpti9mC3KMGyMRDvfU+6Ajx5lkPWMSKTTU02coopyvjB/jEAncJs8iev1jHp7MX6a4lCGiXmz0vI0B43W8EbDZxxyMJ5pSeOZ6k+T6yiGoyiLmrtYfyJpRzEczOztaHavg6nWHcUYc3/XAv3R/PdxoWH8qd4d0tHrKvqGXujiD3rlUcg3tHX0prZJQa/Ncxvlzm9i3A43ZSET4CxwZXSdqX0/IiIiIiIiIiIi1ojv9aD4fOfUvPQAAAAASUVORK5CYII=')

    const [cardList, setCardList] = useState(lastCardList)
    const scrollRef = useRef();

    const setNewCardData = (data, number) => {
        setCardList([...(cardList || []), ...data.cardList])
        lastCardList = [...(cardList || []), ...data.cardList]
        listNumber = number
        len = data.len
        onLoad = false;
        lastJson = json
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
                lastJson = {sorting: 'default', platform: [], language: [], numberPlayers: []}
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

    const onClose = () => {
        setFilterWindowOpen(false);
        setSortWindowOpen(false);
        setCardList(null)
        lastScroll = 0
        lastCardList = null
    }

    if (catalog !== null) {
        if (cardList !== null) {
            return (<div className={style['mainDivision']} style={{paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px',}}>
                <div className={style['title']}>
                    {catalogStructureList.map(catalog => {
                        if (catalog.path === lastPath && typeof catalog.name !== 'undefined') {
                            return catalog.name
                        }
                    })}
                </div>
                <div style={{display:'flex', flexDirection:'row', marginBottom: '3vw'}}>
                <button className={style['sorting']} onClick={() => {
                    setSortWindowOpen(true)
                }}>
                    <div className={style[json.sorting !== 'default' ? 'pulseBg' : '']}/>
                    <div style={{backgroundImage: `url(${icon})`}}/>
                    <p>Сортировка</p>
                </button>
                <button className={style['filter']} onClick={() => {
                    setFilterWindowOpen(true)
                }}>
                    <div
                        className={style[json.platform.length + json.language.length + json.numberPlayers.length > 0 ? 'pulseBg' : '']}/>
                    <div/>
                    <p>Фильтры</p>
                </button>
                </div>
                <div className={'scroll-container-y'} ref={scrollRef}
                     onScroll={async (event) => {
                         lastScroll = event.target.scrollTop
                         if (listNumber < len && event.target.scrollTop + 2000 > scrollRef.current.scrollHeight && !onLoad) {
                             onLoad = true
                             getCardList(setNewCardData, catalog.id, listNumber + 1, json).then()
                         }
                     }}
                     style={{
                         paddingBottom: String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom + 0.03 * window.innerWidth) + 'px',
                         height: '100vh',
                     }}>
                    <div className={style['listGrid']}>

                        {cardList.map(item => (
                                <div style={{marginLeft: '6vw'}}>
                                    <CatalogItem key={item.id} product={item}/></div>))}
                    </div>
                    {cardList.length !== 0 ? '' : <div className={style['title']} style={{margin:'5vw', textAlign:'center'}}>Ничего не найдено, попробуйте изменить фильтры</div>}
                </div>
                {sortWindowOpen ? (<Sorting onClose={onClose} json={json} setJson={setJson} setIcon={setIcon}/>) : ''}
                {filterWindowOpen ? (<Filter onClose={onClose} json={json} setJson={setJson}/>) : ''}
            </div>);
        } else {
            getCardList(setNewCardData, catalog.id, 1, json).then()
            return (<div>
                <div className={style["wrapper"]}>
                    <div className={style["circle"]}></div>
                    <div className={style["circle"]}></div>
                    <div className={style["circle"]}></div>
                    <div className={style["shadow"]}></div>
                    <div className={style["shadow"]}></div>
                    <div className={style["shadow"]}></div>
                </div>
            </div>)
        }
    }
};

export default Catalog;
