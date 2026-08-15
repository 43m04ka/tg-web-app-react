import React, {useEffect} from 'react';
import IndiaCountElement from "./IndiaCountElement";

const IndiaCount = ({ basketList, setSum, onReload }) => {

    let otherCurrencyPrice = 0;
    basketList.forEach(item => {
        if (item.priceInOtherCurrency !== null && item.priceInOtherCurrency !== undefined) {
            otherCurrencyPrice += item.priceInOtherCurrency;
        }
    });


    const roundedInrPrice = Math.ceil(otherCurrencyPrice / 1000) * 1000;


    let sumPrice = roundedInrPrice * 1.3;


    basketList.forEach(item => {
        if (item.priceInOtherCurrency === null || item.priceInOtherCurrency === undefined) {
            sumPrice += item.price;
        }
    });

    useEffect(() => {
        setSum(sumPrice);
    }, [sumPrice, setSum]);

    const changeLeft = roundedInrPrice - otherCurrencyPrice;

    return (
        <div>
            {basketList.map((item, index) => {
                return <IndiaCountElement product={item} key={index} onReload={onReload} />
            })}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div className={'title'} style={{ textAlign: 'left', marginLeft: '15px', fontSize: '17px', color: '#a368ff', marginBottom: '5px' }}>
                    Пополнение баланса
                </div>
                <div className={'title'} style={{ textAlign: 'left', marginRight: '15px', fontSize: '17px', color: '#a368ff', marginBottom: '5px' }}>
                    {roundedInrPrice + ' Rs'}
                </div>
            </div>

            <div className={'text-element'} style={{
                fontSize: '13px',
                textAlign: 'center',
                color: 'white',
                overflow: 'hidden',
                lineHeight: '15px',
                margin: '15px 10px'
            }}>
                {'Выбранные товары обойдутся в ' + otherCurrencyPrice + ' Rs. '}
                {'Баланс аккаунта будет пополнен на ' + roundedInrPrice + ' Rs. '}
                {changeLeft > 0
                    ? 'Непотраченные ' + changeLeft + ' Rs останутся на вашем аккаунте для будущих покупок.'
                    : 'Сумма спишется ровно под расчет.'
                }
            </div>
        </div>
    );
};

export default IndiaCount;