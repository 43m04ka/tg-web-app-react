import React, {useCallback, useEffect, useState} from 'react';
import {Link, Route, Routes, useNavigate} from "react-router-dom";
import {useTelegram} from "../../hooks/useTelegram";
import {useServerUser} from "../../hooks/useServerUser";
import Order from "./Order";

const History = () => {
    const navigate = useNavigate();
    const {tg, user} = useTelegram();
    const {getHistoryList} = useServerUser()

    const [historyData, setHistoryData] = useState(null);

    const onBack = useCallback(async () => {
        navigate(-1);
    }, [])

    useEffect(() => {
        getHistoryList(setHistoryData, user.id).then()
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])


    if (historyData !== null && historyData.length !== 0) {
        return (
            <div>
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
                            <div>
                                <div style={{display: 'flex', justifyContent: 'left', alignItems: 'center'}}>
                                    <div className={'text-element'}>{'Заказ №' + String(order.id)}</div>
                                    <div className={'text-element'} style={{marginLeft: '30px'}}>
                                        {'от ' + String(order.date).replaceAll('/', '.')}
                                    </div>
                                </div>
                                <div className={'text-element'} style={{marginTop: '5px'}}>
                                    {'На сумму: ' + String(order.summa) + ' ₽'}
                                </div>
                            </div>
                        </div>
                        <Order data={order}/>
                    </div>
                ))}
            </div>
        );
    } else if (historyData !== null) {
        return (
            <div style={{display: 'grid'}}>
                <div style={{
                    height: String(window.innerHeight - 60 - 15 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                    marginTop: '15px', textAlign: 'center',
                    color: 'gray', fontSize: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} className={'text-element'}>
                    <div className={'background-basketSaid'} style={{width: '65px', height: '83px'}}/>
                    <div className={'text-element'}>История покупок пуста...</div>
                </div>
                <Link to={'/home0'} className={'link-element'}>
                    <button className={'all-see-button'} style={{marginTop: '10px', width: String(300) + 'px'}}>На
                        главную
                    </button>
                </Link>
            </div>)
    } else {
        return (<div className={'plup-loader'} style={{
            marginTop: String(window.innerHeight / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>);
    }
};

export default History;