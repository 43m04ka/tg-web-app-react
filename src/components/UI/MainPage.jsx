import React, {useEffect} from 'react';
import '../styles/style.css';
import {useTelegram} from "../../hooks/useTelegram";
import useGlobalData from "../../hooks/useGlobalData";
import style from './MainPage.module.scss'
import NavigationBar from "./pages/NavigationBar/NavigationBar";
import CatalogListBody from "./pages/Main/CatalogListBody";

const MainPage = ({page}) => {
    const {tg} = useTelegram();
    const {setPageId} = useGlobalData();


    useEffect(() => {
        setPageId(page.id)
        tg.BackButton.hide();
    }, [])


    return (<div className={style['mainDivision']}>
        <div>
            <CatalogListBody/>
        </div>
        <NavigationBar/>
    </div>);
};

export default MainPage;