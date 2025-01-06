import React, {useEffect, useState} from 'react';
import {Link, Route, Routes} from "react-router-dom";
import ProductList from "./ProductList";
import '../styles/style.css';
import HomeBlock from "./HomeBlock";
import {useTelegram} from "../../hooks/useTelegram";
import HeadSelector from "./HeadSelector";
import Slider from "./Slider";

const Home = ({main_data, height, page}) => {
    const {tg} = useTelegram();
    const [scrollCtrl, setScrollCtrl] = useState(0);
    const [hiddenSelector, setHiddenSelector] = useState(false);
    const [heightMenuButton, setHeightMenuButton] = useState(0);

    useEffect(() => {
        tg.BackButton.hide();
    }, [])


    return (
        <div>

            <HeadSelector page={page} main_data={main_data} hidden = {hiddenSelector}/>

            <div className={'scroll-container-y'} onScroll={(event) => {
                let scroll = event.target.scrollTop
                if(scroll > scrollCtrl+200){
                    setScrollCtrl(scroll)
                    setHiddenSelector(true)
                    setHeightMenuButton(55)
                    console.log(true)
                }else if(scroll<scrollCtrl-100 || scroll === 0){
                    setScrollCtrl(scroll)
                    setHiddenSelector(false)
                    setHeightMenuButton(0)
                    console.log(false)
                }
                if (hiddenSelector && scroll > scrollCtrl){setScrollCtrl(scroll)}
                else if(!hiddenSelector && scroll < scrollCtrl){setScrollCtrl(scroll)}
            }}
                 style={{height: String(height - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top - 120 + heightMenuButton) + 'px'}}>
                <div style={{width: String(window.innerWidth) + 'px'}}>
                    <Slider data={main_data.body[0]}/>
                </div>
                {main_data.body[1].map(category => (
                    <HomeBlock key={category.id} path={category.path} data={category}/>
                ))}
            </div>
        </div>
    )
        ;
};

export default Home;