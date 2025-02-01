import React, {useCallback, useEffect} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {useTelegram} from "../../hooks/useTelegram";

const History = ({historyData}) => {
    const navigate = useNavigate();
    const {tg} = useTelegram();

    const onBack = useCallback(async () => {
        navigate(-1);
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])


    if(historyData.length >0) {
        return (
            <div>
                <div className={'title'}
                     style={{marginTop: '5px', marginLeft: 'auto', textAlign: 'center'}}>История
                    заказов
                </div>
                {historyData.map(order => (
                    <Link to={'/history/' + String(order.id)} className={'link-element'}>
                        <div style={{
                            background: '#131313',
                            padding: '5px',
                            borderRadius: '7px',
                            margin: '5px',
                            display: 'grid',
                            gridTemplateColumns: '1fr 20px',
                            alignItems: 'center',
                            marginTop: '7px'
                        }}>
                            <div>
                                <div style={{display: 'flex', justifyContent: 'left', alignItems: 'center'}}>
                                    <div className={'text-element'}>{'Заказ №' + String(order.id)}</div>
                                    <div className={'text-element'} style={{marginLeft: '30px'}}>
                                        {'от ' + String(order.date)}
                                    </div>
                                </div>
                                <div className={'text-element'} style={{marginTop: '5px'}}>
                                    {'На сумму: ' + String(order.summa) + ' ₽'}
                                </div>
                            </div>
                            <div className={'background-arrowGray'}
                                 style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                        </div>
                    </Link>
                ))}
            </div>
        );
    }else{
        return (
            <div style={{display: 'grid'}}>
                <div style={{
                    height: String(height - 60 - 15 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
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
    }
};

export default History;