import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Link, Route, Routes} from "react-router-dom";
import ProductList from "./ProductList";
import '../styles/style.css';
import HomeBlock from "./HomeBlock";
import {useTelegram} from "../../hooks/useTelegram";
import HeadSelector from "./HeadSelector";
import Slider from "./Slider";
import HomeBlockDon from "./HomeBlockDon";

let scrollCtrl = 0;
let lastScroll = 0;

const Home = ({main_data, height, page, setBasket}) => {
    const {tg, user} = useTelegram();
    const [hiddenSelector, setHiddenSelector] = useState(false);
    const [basketData, setBasketData] = useState([]);
    const scrollContainer = useRef();

    useEffect(() => {
        tg.BackButton.hide();
        onGetData()
        scrollContainer.current.scrollTop = lastScroll;
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
                console.log(r.body)
                r.body.map(el => {
                    console.log(el.body.tab, page - 1)
                    if (Number(el.body.tab) === page - 1) {
                        newArray = [...newArray, el]
                    }
                })
                setBasket(r.body);
                setBasketData(r.body);
            })
        })
    }, [sendData, setBasket])


    return (
        <div>

            <HeadSelector page={page} main_data={main_data} basketData={basketData} hidden={hiddenSelector}/>

            <div className={'scroll-container-y'} onScroll={(event) => {
                let scroll = event.target.scrollTop
                if (scroll > scrollCtrl + 200 && !hiddenSelector) {
                    scrollCtrl = scroll
                    setHiddenSelector(true)
                } else if ((scroll < scrollCtrl - 100 || scroll === 0) && hiddenSelector) {
                    scrollCtrl = scroll
                    setHiddenSelector(false)
                }
                if (hiddenSelector && scroll > scrollCtrl) {
                    scrollCtrl = scroll
                } else if (!hiddenSelector && scroll < scrollCtrl) {
                    scrollCtrl = scroll
                }
                lastScroll = scroll
            }} ref={scrollContainer}
                 style={{
                     height: String(height - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top - 50) + 'px'
                 }}>
                <div style={{
                    height: '55px'
                }}>
                    <div style={{height: '300px', overflow: 'hidden'}}></div>
                </div>
                <div style={{width: String(window.innerWidth) + 'px'}}>
                    <Slider data={main_data.body[0]}/>
                </div>
                <div style={{marginBottom: '15px'}}>
                    {main_data.body[1].map(category => {
                        try {
                            if (typeof category.body[0].body.title !== 'undefined' && category.name !== '') {
                                return (
                                    <HomeBlock key={category.id} path={category.path} data={category}/>
                                )
                            } else if (typeof category.body[0].path !== 'undefined') {
                                return (
                                    <HomeBlockDon key={category.id} path={category.path} data={category}/>
                                )
                            }
                        } catch (e) {

                        }
                    })}
                </div>
            </div>
        </div>
    )
        ;
};

export default Home;