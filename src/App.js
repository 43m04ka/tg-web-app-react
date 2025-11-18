import './App.css';

import React, {useCallback, useEffect, useState} from "react";
import {useTelegram} from "./hooks/useTelegram";
import {Route, Routes, useNavigate} from "react-router-dom";
import Catalog from "./components/UI/pages/Catalog/Catalog";
import MainPage from "./components/UI/MainPage";
import ErrorPage from "./components/UI/pages/other/ErrorPage";
import AdminPanel from "./components/UI/pages/AdminPanel/AdminPanel";
import ProductListSelector from "./components/UI/pages/other/ProductListSelector";
import History from "./components/UI/pages/other/History";
import Favorites from "./components/UI/pages/other/Favorites";
import AP_Authentication from "./components/UI/pages/AdminPanel/AP_Authentication";
import useGlobalData from "./hooks/useGlobalData";
import Product from "./components/UI/pages/Product/Product";
import style from './App.module.scss'
import {repeat} from "rxjs";

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));

function repeatArray(arr, count) {
    if (count < 0) {
        throw new RangeError("repeat count must be non-negative");
    }
    if (count === 0) {
        return [];
    }
    let result = [];
    for (let i = 0; i < count; i++) {
        let randList = [];

        while (randList.length !== 10) {
            let index = getRandomInt(arr.length);
            randList.push(arr[index]);
        }

        result.push(randList);
    }
    return result;
}

let interval = -1
let timeouts = repeatArray([-1], 150)

const tags = 'forza gta steam valorant lastofus battlefield psplus watchdogs minecraft psn ghost cyberpunk gamepass скидки horizon apex witcher halo diablo акции godofwar fortnite лицензия ключи resident callofduty dlc xbox tsushima uncharted reddead spiderman store assassin пополнение doom fallout игры mortal helldivers playstation rdr2 farcry playstation xbox steam psplus gamepass скидки акции ключи игры stalker alanwake starwars tekken streetfighter dragonage mass effect overwatch destiny control returnal deathstranding bloodborne daysgone detroit re8 forza gears avowed fable payday mafia bioshock borderlands titanfall sekiro eldenring nier tombraider ghostrunner store подписка пополнение minecraft baldur'

const tickets = repeatArray(tags.split(' '), 30)

function App() {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();

    const {
        pageId,
        pageList,
        updatePageList,
        catalogList,
        updateCatalogList,
        mainPageCards,
        updateMainPageCards,
        catalogStructureList,
        updateCatalogStructureList,
        updatePreviewFavoriteData,
        updatePreviewBasketData,
        updateBasket
    } = useGlobalData();


    const [size, setSize] = React.useState(window.innerHeight);
    const [isLoaded, setIsLoaded] = React.useState(true);

    const resizeHandler = () => {
        setSize(window.innerHeight);
    };

    useEffect(() => {
        window.addEventListener("resize", resizeHandler);
        resizeHandler();
        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, [])

    useEffect(() => {
        try {
            tg.disableVerticalSwipes();
            tg.lockOrientation();
            tg.requestFullscreen();
        } catch (e) {
        }
        tg.ready();
    }, [])

    useEffect(() => {
        setTimeout(() => {
            updatePageList()
        }, 25000)
        window.clearInterval(interval)

        for (let i = 0; i < 30; i++) {
            timeouts[i] = setTimeout(() => {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            }, 15 * i + 550)
        }

        for (let i = 30; i < 60; i++) {
            timeouts[i] = setTimeout(() => {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }, 15 * i + 1100)
        }

        interval = setInterval(() => {
            for (let i = 0; i < 30; i++) {
                timeouts[i] = setTimeout(() => {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                }, 15 * i + 550)
            }

            for (let i = 30; i < 60; i++) {
                timeouts[i] = setTimeout(() => {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }, 15 * i + 1100)
            }
        }, 2000)
        updateCatalogStructureList()
        updateMainPageCards()
        updateCatalogList()
        updatePreviewFavoriteData(user.id)
    }, [])

    if (catalogList !== null && pageList !== null && mainPageCards !== null && isLoaded) {
        setTimeout(() => {
            window.clearInterval(interval)
            timeouts.map(id => {
                window.clearTimeout(id)
            })
            setIsLoaded(false)
            window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        }, 150)
    }

    if (!isLoaded) {
        if (window.location.pathname === '/') {
            navigate(pageList[0]['link'])
        }
        return (<div className={style['App']}>
            <Routes>
                {pageList.map((page) => (
                    <Route path={page['link'] + '/*'} key={page['id']} element={<MainPage page={page}/>}/>))}
                <Route path={'favorites'} element={<Favorites/>}/>
                <Route path={'/catalog/*'} element={<Catalog height={size}/>}/>
                <Route path={'/card/*'} element={<Product/>}/>
                <Route path={'/choice-catalog/*'} element={<ProductListSelector/>}/>
                <Route path={'admin-panel/*'} element={<AdminPanel/>}/>
                <Route path={'admin'} element={<AP_Authentication/>}/>
                <Route path={'/history'} element={<History/>}/>
                <Route path="*" element={<ErrorPage/>}/>
            </Routes>
        </div>);
    } else {
        return (<div className={style["container"]}>
                <div className={style['loader']}>
                    <div className={style['box']}>
                        <div className={style['logo']}>
                            <div/>
                        </div>
                    </div>
                    <div className={style['box']}></div>
                    <div className={style['box']}></div>
                    <div className={style['box']}></div>
                    <div className={style['box']}></div>
                </div>
                <div className={style['fillContainer']}>
                    <div
                        style={{scale: (catalogList !== null && pageList !== null && mainPageCards !== null ? '12' : '0')}}/>
                </div>
                <div className={style["ticker"]}>
                    {tickets.map((item, index) => (
                        <div className={style["ticker__in"]}>
                            {item.map((tag) => (
                                <span className={style["ticker__item"]}>{tag}</span>
                            ))}
                        </div>))
                    }
                </div>
            </div>
        );
    }
}

export default App;
