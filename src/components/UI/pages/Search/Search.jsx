import React, {useCallback, useEffect, useRef, useState} from 'react';
import style from './Search.module.scss'
import {useTelegram} from "../../../../hooks/useTelegram";
import HomeScreen from "./Elements/homeScreen";
import useGlobalData from "../../../../hooks/useGlobalData";
import CatalogItem from "../Catalog/CatalogItem";
import {useNavigate} from "react-router-dom";
import Sorting from "../../Elements/Filter/Sorting";
import Filter from "../../Elements/Filter/Filter";

let timerId = -1


let lastListRes = []
let lastText = ''
let lastScroll = 0
let lastJson = {platform: [], language: [], numberPlayers: []}


const Search = () => {
    const {tg} = useTelegram()
    const {pageId, setBarIsVisible} = useGlobalData()
    const inputRef = useRef(null)
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    const [sortWindowOpen, setSortWindowOpen] = useState(false);
    const [filterWindowOpen, setFilterWindowOpen] = useState(false);
    const [json, setJson] = useState(lastJson);

    const [inputValue, setInputValue] = useState(lastText)
    const [cardList, setCardList] = useState(lastListRes)
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [icon, setIcon] = useState('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAACjUlEQVR4nO3dR24UQRSH8bciCAEmR2PSFRBwJ0AI7mLBCZAQG4JkjmDA5OBAnDmDkYDNh0qalkwS4GlPvffq/5N65U2Xv03PTNVrMxEREREREREREZkI4DxwdXSdq30/zQJ2Avf41d3yt9r312KMef7sMbC79n02AZgCHvB3T4A9te83Nf49hqJMKMZD/t9TRekZsAt4tI4Ya6Psrb2OFBg/RueZoowJ2Ac8pz9vgIO11xU5xoseYyjKegH7NyhGZxE4VHudkWK83MAYiuIwRmcJOFx73S4BB4BXTJ6iOIrRWVaUH2O8pr5l4Ii1rDx+OonRWWk2CnAUeIs/H4Hj1hJg2mmM9qKMYrzDv0/ACcsMOBYkRv4ooxjviWcAnLRMAsdYG+WUZQDMAB+Ibxg+SqIY8aOUx8bR42M2Q+C0BfzWttx4VsOyRosCuEV+Ny0CYAfwjfy+AtvNu/LMTjtmzDtgE7BKfp+BzRYBcI38Zi3xHtxo5sMdeQC2AheBOWAhyTUHXAC21P7/ioiIiIiIRPlgeBm47+AD3UJPV1nLpbI2a/RcoFfla6EpiwK4Tn6zFkFDX7+vlrWad2WnH+2YNu/Kz5qjnzez+wJsswjKBgDyu2FRNLANaFDO0VskCXctpti9mC3KMGyMRDvfU+6Ajx5lkPWMSKTTU02coopyvjB/jEAncJs8iev1jHp7MX6a4lCGiXmz0vI0B43W8EbDZxxyMJ5pSeOZ6k+T6yiGoyiLmrtYfyJpRzEczOztaHavg6nWHcUYc3/XAv3R/PdxoWH8qd4d0tHrKvqGXujiD3rlUcg3tHX0prZJQa/Ncxvlzm9i3A43ZSET4CxwZXSdqX0/IiIiIiIiIiIi1ojv9aD4fOfUvPQAAAAASUVORK5CYII=')

    useEffect(() => {
        lastListRes = cardList
        lastText = inputValue
    }, [cardList, inputValue]);

    const getCardList = async () => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/getSearch', {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({
                str: inputValue, pageId: pageId, json: json
            })
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                let resultList = []
                prom.cards.map(card => {
                    let flag = true
                    resultList.map(resCard => {
                        if (card.name === resCard.name && card.similarCard?.price === resCard.similarCard?.price && card.regionActivate === resCard.regionActivate && card.choiceRow === resCard.choiceRow && card.choiceColumn === resCard.choiceColumn) {
                            flag = false
                        }
                    })
                    if (flag) {
                        resultList.push(card)
                    }
                }).filter(el => el !== null)
                if (inputValue === '') {
                    setCardList(null)
                } else {
                    setCardList(resultList.splice(0, 20))
                }
            })
        })
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: lastScroll, behavior: "instant",
            });
        }
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, []);

    const onBack = useCallback(() => {
        navigate(-1);
        lastScroll = 0
        lastText = ''
        lastListRes = []
        setBarIsVisible(true)
    }, [])

    const handleFocus = () => {
        setIsInputFocused(true);
    };

    const handleBlur = () => {
        setTimeout(() => {
            setIsInputFocused(false);
        }, 100)
    };

    useEffect(() => {
        window.clearTimeout(timerId);
        if (inputValue !== '') {
            timerId = window.setTimeout(() => {
                getCardList().then()
            }, 250)
        } else {
            setCardList(null)
        }
    }, [inputValue])

    const onClose = () => {
        setFilterWindowOpen(false);
        setSortWindowOpen(false);
        setCardList(null)
        lastScroll = 0
        lastListRes = null
        setBarIsVisible(true)
        getCardList().then()
    }

    return (<div className={style['mainDivision']}
                 style={{paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px'}}>
        <div>
            <div>
                <div/>
                <input placeholder={'Поиск'}
                       onFocus={handleFocus}
                       onBlur={handleBlur}
                       value={inputValue}
                       ref={inputRef}
                       enterkeyhint="search"
                       defaultValue={lastText}
                       onChange={(event) => {
                           setInputValue(event.target.value)
                           setCardList(null)
                       }}></input>
                <button onClick={() => {
                    setInputValue('');
                    setCardList(null)
                    lastJson = {sorting: 'default', platform: [], language: [], numberPlayers: []}
                    setJson(lastJson)
                }}>
                    <div/>
                </button>
            </div>
        </div>
        {inputValue !== '' ? (cardList !== null ? (cardList.length > 0 ? (<div style={{overflow:'hidden', display:'grid', gridTemplateRows:'12vw 1fr'}}>
            <button className={style['filter']} onClick={() => {
                setFilterWindowOpen(true)
                setBarIsVisible(false)
            }}>
                <div
                    className={style[json.platform.length + json.language.length + json.numberPlayers.length > 0 ? 'pulseBg' : '']}/>
                <div/>
                <p>Фильтры</p>
            </button>
            <div className={style['scrollList']}
                 onScroll={(event) => {
                     lastScroll = (event.target.scrollTop);
                 }}
                 ref={scrollRef}
                 style={{paddingBottom: String(window.innerWidth * 0.1 + tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom + (window.screen.availHeight - window.innerHeight - (window.screen.availHeight - window.innerHeight > 0) ? window.innerWidth * 0.20 : 0) + 10) + 'px'}}>
                <div className={style['listGrid']}>
                    {cardList.map(item => {
                        return (<div style={{marginLeft: '6vw'}}>
                            <CatalogItem key={item.id} product={item} isClicked={!isInputFocused}/>
                        </div>)
                    })}
                </div>
                <div className={style['helpPlace']}>
                    <div> не нашли то, что искали?</div>
                    <div> напишите нам, мы поможем</div>
                    <button onClick={() => window.open('https://t.me/gwstore_admin')}>Написать в поддержку</button>
                </div>
            </div>
        </div>) : (<div className={style['emptyList']}>
            <div/>
            <div>Нет результатов</div>
            <div>по запросу "{inputValue}"</div>
            <div>ничего не найдено.</div>
            <div>попробуйте другой запрос</div>
            <div>или напишите в поддержку</div>
            <button onClick={() => window.open('https://t.me/gwstore_admin')}>Написать в поддержку</button>
        </div>)) : (<div className={style["wrapper"]}>
            <div className={style["circle"]}></div>
            <div className={style["circle"]}></div>
            <div className={style["circle"]}></div>
            <div className={style["shadow"]}></div>
            <div className={style["shadow"]}></div>
            <div className={style["shadow"]}></div>
        </div>)) : (<div>
            <HomeScreen setInputValue={setInputValue}/>
            <div className={style['welcome']}/>
        </div>)}

        {sortWindowOpen ? (<Sorting onClose={onClose} json={json} setJson={setJson} setIcon={setIcon}/>) : ''}
        {filterWindowOpen ? (<Filter onClose={onClose} json={json} setJson={setJson}/>) : ''}
    </div>);
};

export default Search;