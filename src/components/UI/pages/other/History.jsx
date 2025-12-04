import React, {useCallback, useEffect, useState} from 'react';
import {Link, Route, Routes, useNavigate} from "react-router-dom";
import {useTelegram} from "../../../../hooks/useTelegram";
import {useServerUser} from "../../../../hooks/useServerUser";
import Order from "./Order";
import style from "../Basket/Basket.module.scss";
import Recommendations from "../Product/Elements/Recommendations";

const History = () => {
    const navigate = useNavigate();
    const {tg, user} = useTelegram();
    const {getHistoryList} = useServerUser()

    const [historyData, setHistoryData] = useState(null);

    useEffect(() => {
        getHistoryList(setHistoryData, user.id).then()
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', () => navigate(-1))
        return () => {
            tg.offEvent('backButtonClicked', () => navigate(-1))
        }
    }, [])


    if (historyData !== null && historyData.length !== 0) {
        return (
            <div style={{position: 'relative', overflowY: 'scroll', height:'100vh',   paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px',
                paddingBottom: String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom + 0.17 * window.innerWidth) + 'px',
            }}>
                <div className={'title'}
                     style={{marginTop: '5px', marginLeft: 'auto', textAlign: 'center'}}>История
                    заказов
                </div>
                {historyData.map(order => (
                    <div style={{
                        background: '#131313',
                        padding: '5px',
                        borderRadius: '7px',
                        margin: '5px',
                        alignItems: 'center',
                        marginTop: '7px'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 20px',
                        }}>
                            <div style={{marginLeft:'10px'}}>
                                <div style={{display: 'flex', justifyContent: 'left', alignItems: 'center'}}>
                                    <div className={'text-element'}>{'Заказ №' + String(order.id)}</div>
                                    <div className={'text-element'} style={{marginLeft: '15px'}}>
                                        {'от ' + String(order.date).replaceAll('/', '.')}
                                    </div>
                                    <div className={'text-element'} style={{marginLeft: '15px'}}>
                                        {'На сумму: ' + String(order.summa) + ' ₽'}
                                    </div>
                                </div>

                            </div>
                        </div>
                        <Order data={order}/>
                    </div>
                ))}
            </div>
        );
    } else if (historyData !== null) {
        return (<div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflowY: 'scroll',
            height: '100vh',
            paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px',
            paddingBottom: String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom) + 'px',
        }}>
            <div className={style['emptyBasket']}>
                <div/>
                <div>В истории покупок ничего нет</div>
                <button className={style['button']} style={{background: '#454545'}} onClick={() => {
                    navigate('/');
                }}>Перейти к покупкам
                </button>
            </div>
            <Recommendations/>
        </div>)
    } else {
        return (<div className={'plup-loader'} style={{
            marginTop: String(window.innerHeight / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>);
    }
};

export default History;