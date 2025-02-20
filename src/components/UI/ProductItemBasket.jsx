import React, {useCallback} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {Link} from "react-router-dom";

const ProductItemBasket = ({setBasketF, product}) => {
    const item = product;
    const {user} = useTelegram();

    const sendData = {
        method: 'del',
        mainData: item.id,
        user: user,
    }

    const onSendData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendData)
        }).then(r => {
            let Promise = r.json()
            Promise.then(r => {
                console.log(r.body)
                return setBasketF(r.body);
            })
        })
    }, [sendData])

    let platform = ''
    if (typeof item.body.platform !== 'undefined') {
        if (typeof item.body.view === 'undefined') {
            platform = item.body.platform
        }else{
            platform = item.body.view
        }
    } else {
        platform = ''
    }

    let price = ''
    if(item.body.isSale){
        price = item.body.price + ' ₽'
    }else {
        price = 'Нет в продаже!'
    }

    return (
        <div className={'box-item-basket'}>
            <div className={'title'} style={{marginLeft: '10px'}}>{item.number + '.'}</div>
            <Link to={'/card/'+item.id} className={'link-element'}
                  style={{display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>
                <img src={item.body.img} alt={item.body.title} className={'img-mini'}/>
                <div className={'box-grid-row'}>
                    <div className={'text-element text-basket'} style={{
                        marginTop: '3px',
                        lineHeight: '15px',
                        height: '30px',
                        fontSize: '13px',
                        overflow: 'hidden'
                    }}>{item.body.title}</div>
                    <div className={'text-element text-basket'} style={{
                        marginTop: '3px',
                        lineHeight: '14px',
                        height: '14px',
                        fontSize: '9px',
                        overflow: 'hidden',
                        marginBottom:'0px'
                    }}>{platform}</div>
                    <div className={'text-element text-basket'} style={{
                        lineHeight: '15px',
                        marginTop:'0',
                        height: '15px',
                        fontSize: '15px'
                    }}>{price}</div>
                </div>
            </Link>
            <div onClick={onSendData} className={'button-trash'}>
                <div className={'background-trash'} style={{padding: '10px', height: '20px', width: '20px'}}>
                </div>
            </div>
        </div>
    );
};

export default ProductItemBasket;