import {useState} from 'react';
import style from './PositionBasket.module.scss';

const PositionBasket = ({product, page}) => {
    const item = product;
    const [counter, setCounter] = useState(1);

    let oldPrice = ''
    let parcent = ''
    let type = 0
    let price = item.price.toLocaleString() + ' ₽'


    if (item.oldPrice !== null) {
        type = 1
        oldPrice = item.oldPrice.toLocaleString() + ' ₽'
        parcent = 'Скидка −' + Math.ceil((1 - item.price / item.oldPrice) * 100) + '%' + ' ' + item.endDatePromotion
    } else if (item.similarCard !== null) {
        type = 0
        price = item.similarCard?.price.toLocaleString() + ' ₽'
        if (typeof item.similarCard.oldPrice !== 'undefined' && typeof item.similarCard.oldPrice !== 'undefined') {
            type = 1
            parcent = 'Скидка −' + Math.ceil((1 - item.similarCard?.price / item.similarCard?.oldPrice) * 100) + '%' + ' ' + item.similarCard?.endDatePromotion
            oldPrice = item.similarCard?.oldPrice.toLocaleString() + ' ₽'
        }

    }

    if (item.priceInOtherCurrency !== null && page === 3) {
        price = item.priceInOtherCurrency.toLocaleString() + ' Rs'
        type = 0
        parcent = 'Цена в PS Store'
    }

    let parcentEl = (<div></div>)
    if (parcent !== '') {
        parcentEl = (<div style={{
            lineHeight: '20px',
            background: '#ff5d5d',
            paddingLeft: '3px',
            paddingRight: '3px',
            borderRadius: '5px',
            marginBottom: '5px',
            textDecoration: 'none',
            textAlign: 'left',
            marginRight: '5px',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            overflow: 'hidden',
            color: 'white',
            width: 'max-content',
            height: '20px'
        }}>{parcent}</div>)
    }

    return (
        <div className={style['container']}>
            <div>
                <div className={style['positionImage']} style={{backgroundImage: "url('" + item.image + "')"}}/>
                <div className={style['infoPlace']}>
                    <p>{item.name + (item.choiceRow !== null ? ' • ' + item.choiceRow : '')}</p>
                    <p>{'для ' + item.platform || ''}</p>
                </div>

            </div>
            <div>
                <div className={style['buttonPlace']}>
                    <div/>
                    <div/>
                    <div className={style['productBasketCounter']}>
                        <div onClick={() => {
                            setCounter(counter - 1)
                        }}>
                            <p>-</p>
                        </div>
                        <p>{counter} шт.</p>
                        <div onClick={() => {
                            setCounter(counter + 1)
                        }}>
                            <p>+</p>
                        </div>
                    </div>

                </div>
                <div className={style['pricePlace']}>
                    <p className={style['priceOld']}>{oldPrice}</p>
                    <p className={style[type === 0 ? 'priceDefault' : 'priceDiscount']}>{price}</p>
                </div>
            </div>
        </div>);
};

export default PositionBasket;