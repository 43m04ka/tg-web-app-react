import React from 'react';
import {Link} from "react-router-dom";

const Order = ({data}) => {
    return (
        <div>
            <div className={'title'} style={{marginTop:'10px', marginLeft:'auto', textAlign:'center'}}>{'Заказ №'+String(data.id)}</div>
            {data.body.map(item => (
                <div style={{display:'grid', gridTemplateColumns:'75px 1fr', marginLeft:'10px', marginRight:'10px', background:'#131313', padding:'5px', borderRadius:'7px', marginTop:'5px'}}>
                        <img src={item.body.img} alt={item.body.title} className={'img-mini'}/>
                        <div style={{display:'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop:'2px', paddingLeft:'5px', paddingBottom:'6px'}}>
                            <div className={'text-element text-basket'} style={{
                                marginTop: '3px',
                                lineHeight: '15px',
                                height: '30px',
                                fontSize: '13px',
                                overflow: 'hidden'
                            }}>{item.body.title}</div>
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