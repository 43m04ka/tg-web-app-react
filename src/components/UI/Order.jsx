import React, {useCallback, useEffect} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {useTelegram} from "../../hooks/useTelegram";

const Order = ({data}) => {
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

    return (
        <div>
            {data.body.map(item => (
                <div style={{display:'grid', gridTemplateColumns:'75px 1fr', marginLeft:'10px', marginRight:'10px', background:'#131313', padding:'5px', borderRadius:'7px', marginTop:'5px'}}>
                        <img src={item.body.image} alt={item.body.name} className={'img-mini'}/>
                        <div style={{display:'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop:'2px', paddingLeft:'5px', paddingBottom:'6px'}}>
                            <div className={'text-element text-basket'} style={{
                                marginTop: '3px',
                                lineHeight: '15px',
                                height: '30px',
                                fontSize: '13px',
                                overflow: 'hidden'
                            }}>{item.body.name + (item.body.choiceColumn !== null? ` ${item.body.choiceColumn} ${item.body.choiceRow}` : '' )}</div>
                            <div className={'text-element text-basket'} style={{
                                lineHeight: '15px',
                                marginTop: '0',
                                height: '15px',
                                fontSize: '15px'
                            }}>{item.body.price + ' ₽'}</div>
                        </div>
                </div>
            ))}
        </div>
    );
};

export default Order;