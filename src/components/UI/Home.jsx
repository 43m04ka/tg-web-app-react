import React, {useCallback, useEffect, useState} from 'react';
import {Link, Route, Routes} from "react-router-dom";
import ProductList from "./ProductList";
import '../styles/style.css';
import HomeBlock from "./HomeBlock";
import {useTelegram} from "../../hooks/useTelegram";
import HeadSelector from "./HeadSelector";
import Slider from "./Slider";
import HomeBlockDon from "./HomeBlockDon";

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

            <HeadSelector page={page} main_data={main_data} basketData={basketData} hidden={hiddenSelector}
                          setLenBasket={setBasketLen}/>

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
                } else if (!hiddenSelector && scroll < scrollCtrl) {
                    scrollCtrl = scroll
                }
            }}
                 style={{
                     height: String(height - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top - 50) + 'px'
                 }}>
                <div style={{
                    height: '65px'
                }}>
                    <div style={{height: '300px', overflow: 'hidden'}}></div>
                </div>
                <div style={{width: String(window.innerWidth) + 'px'}}>
                    <Slider data={main_data.body[0]}/>
                </div>
                <div style={{marginBottom: '15px'}}>
                    {main_data.body[1].map(category => {
                        if(typeof category.body[0].title !== 'undefined' && category.name !== '') {
                            return (
                                <HomeBlock key={category.id} path={category.path} data={category}/>
                            )
                        }else if(typeof category.body[0].path !== 'undefined'){
                            return (
                                <HomeBlockDon key={category.id} path={category.path} data={category}/>
                            )
                        }
                    })}
                </div>
            </div>
        </div>
    )
        ;
};

export default Home;