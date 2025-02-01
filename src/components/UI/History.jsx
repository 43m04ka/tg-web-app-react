import React, {useCallback} from 'react';
import {Link} from "react-router-dom";
import {useTelegram} from "../../hooks/useTelegram";

const History = ({historyData}) => {
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
};

export default History;