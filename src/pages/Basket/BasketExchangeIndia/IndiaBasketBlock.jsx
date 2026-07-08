import React from 'react';
import PositionBasket from "../Elements/PositionBasket";


const IndiaBasketBlock = ({ basket, promoData, catalogList, pageId, updateBasket, style }) => {
    // 1. Фильтруем товары по категориям
    const indiaItems = basket.filter(item => item.priceInOtherCurrency !== null && item.priceInOtherCurrency !== undefined);
    const rubItems = basket.filter(item => item.priceInOtherCurrency === null || item.priceInOtherCurrency === undefined);

    // 2. Считаем математику для Индии
    const totalInr = indiaItems.reduce((acc, el) => acc + (el.priceInOtherCurrency * el.count || 0), 0);
    const roundedInr = Math.ceil(totalInr / 1000) * 1000;
    const inrToRub = roundedInr * 1.3;
    const changeLeft = roundedInr - totalInr;

    return (
        <div className={style['basketBlock']} style={{ height: 'auto', paddingBottom: '16px' }}>
            <p className={style['title']}>Ваша корзина:</p>

            {/* 1. Индийские товары в рупиях */}
            {indiaItems.map((item, index) => (
                <React.Fragment key={item.id || index}>
                    <PositionBasket
                        percent={promoData.percent}
                        product={item}
                        otherCurrency={true}
                        onReload={() => updateBasket(catalogList, pageId)}
                    />
                    {index !== indiaItems.length - 1 && (
                        <div className={style['separator']} style={{ height: '1px', marginTop: '0' }} />
                    )}
                </React.Fragment>
            ))}

            {/* 2. Аккуратный блок детализации индийского баланса */}
            {totalInr > 0 && (
                <div style={{
                    margin: '12px 0px 16px 0px',
                    padding: '14px 16px',
                    background: '#171717',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: '#f5f5f7',
                    border: '1px solid #222530',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#8e8e93' }}>Стоимость товаров:</span>
                        <span style={{ fontWeight: '500' }}>{totalInr.toLocaleString()} Rs</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#8e8e93' }}>Пополнение баланса (кратно 1000Rs):</span>
                        <span style={{ fontWeight: '600', color: '#00cc66' }}>{roundedInr.toLocaleString()} Rs</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#8e8e93' }}>Стоимость пополнения в рублях:</span>
                        <span style={{ fontWeight: '600', color: '#fff' }}>{inrToRub.toLocaleString()} ₽</span>
                    </div>

                    <div style={{
                        height: '1px',
                        background: '#222530',
                        margin: '4px 0'
                    }} />

                    <div style={{
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: changeLeft > 0 ? '#a368ff' : '#8e8e93',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <span style={{ fontSize: '14px' }}>{changeLeft > 0 ? '👛' : '🎯'}</span>
                        <span>
                            {changeLeft > 0
                                ? `Остаток ${changeLeft.toLocaleString()} Rs сохранится на вашем аккаунте PSN.`
                                : 'Сумма спишется ровно под расчет без остатка.'
                            }
                        </span>
                    </div>
                </div>
            )}

            <p className={style['title']}>Подписки:</p>

            {rubItems.map((item, index) => (
                <React.Fragment key={item.id || index}>
                    <PositionBasket
                        percent={promoData.percent}
                        product={item}
                        onReload={() => updateBasket(catalogList, pageId)}
                    />
                    {index !== rubItems.length - 1 && (
                        <div className={style['separator']} style={{ height: '1px', marginTop: '0' }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default IndiaBasketBlock;