import React, {useCallback, useEffect, useState} from 'react';
import {Link, Route, Routes} from "react-router-dom";
import ProductList from "./ProductList";
import '../styles/style.css';
import HomeBlock from "./HomeBlock";
import {useTelegram} from "../../hooks/useTelegram";
import HeadSelector from "./HeadSelector";
import Slider from "./Slider";

let scrollCtrl = 0;
const Home = ({main_data, height, page, setBasket}) => {
    const {tg, user} = useTelegram();
    const [hiddenSelector, setHiddenSelector] = useState(false);
    const [heightMenuButton, setHeightMenuButton] = useState(0);
    const [basketLen, setBasketLen] = useState(null);
    const [basketData, setBasketData] = useState([]);

    useEffect(() => {
        tg.BackButton.hide();
        onGetData()
    }, [])

    const basketColReload = () => {
        let newArray = []
        basketData.map(el => {
            console.log(el.tab, page)
            if (Number(el.tab) === page - 1) {
                newArray = [...newArray, el]
            }
        })
        setBasketLen(newArray.length);
    }

    const sendData = {
        method: 'get',
        user: user,
    }

    const onGetData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendData)
        }).then(r => {
            let Promise = r.json()
            Promise.then(r => {
                let newArray = []
                r.body.map(el => {
                    console.log(el.tab, page - 1)
                    if (Number(el.tab) === page - 1) {
                        newArray = [...newArray, el]
                    }
                })
                setBasket(r.body);
                setBasketData(r.body);
                setBasketLen(newArray.length);
            })
        })
    }, [sendData, setBasket])


    return (
        <div>

            <HeadSelector page={page} main_data={main_data} basketLen={basketLen} hidden={hiddenSelector}
                          basketReload={basketColReload}/>

            <div className={'scroll-container-y'} onScroll={(event) => {
                let scroll = event.target.scrollTop
                if (scroll > scrollCtrl + 200 && !hiddenSelector) {
                    scrollCtrl = scroll
                    setHiddenSelector(true)
                    setHeightMenuButton(55)
                } else if ((scroll < scrollCtrl - 100 || scroll === 0) && hiddenSelector) {
                    scrollCtrl = scroll
                    setHiddenSelector(false)
                    setHeightMenuButton(0)
                }
                if (hiddenSelector && scroll > scrollCtrl) {
                    scrollCtrl = scroll
                } else if (!hiddenSelector&&scroll < scrollCtrl) {
                    scrollCtrl = scroll
                }
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