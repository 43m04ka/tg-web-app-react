import React, {useEffect, useState} from 'react';
import '../styles/style.css';
import {useTelegram} from "../../hooks/useTelegram";
import useGlobalData from "../../hooks/useGlobalData";
import style from './MainPage.module.scss'
import NavigationBar from "./pages/NavigationBar/NavigationBar";
import CatalogListBody from "./pages/MainScreen/CatalogList/CatalogListBody";
import CatalogListHead from "./pages/MainScreen/CatalogList/CatalogListHead";
import {Route, Routes} from "react-router-dom";
import Search from "./pages/other/Search";
import Basket from "./pages/Basket/Basket";
import Info from "./pages/other/Info";

const MainPage = () => {
    const {tg} = useTelegram();
    const [heightTab, setHeightTab] = useState(0);


    useEffect(() => {
        tg.BackButton.hide();
    }, [])


    return (<div className={style['mainDivision']}>
        <div>
            <CatalogListHead/>
            <CatalogListBody/>
        </div>
        <div>
            <div style={{height: heightTab}}>
                <Routes>
                    <Route path="/search" element={<Search/>}/>
                    <Route path="/basket" element={<Basket/>}/>
                    <Route path="/more" element={<Info/>}/>
                </Routes>
            </div>
        </div>
        <NavigationBar setHeightTab={setHeightTab} heightTab={heightTab}/>
    </div>);
};

export default MainPage;