import React, {useEffect} from 'react';
import '../styles/style.css';
import {useTelegram} from "../../hooks/useTelegram";
import useGlobalData from "../../hooks/useGlobalData";
import style from './MainPage.module.scss'
import NavigationBar from "./pages/NavigationBar/NavigationBar";

const MainPage = ({page}) => {
    const {tg} = useTelegram();
    const {setPageId} = useGlobalData();


    useEffect(() => {
        setPageId(page.id)
        tg.BackButton.hide();
    }, [])


    return (<div className={style['mainDivision']}>
        <div style={{border:'1px solid red'}}></div>
        <NavigationBar/>
    </div>);
};

export default MainPage;