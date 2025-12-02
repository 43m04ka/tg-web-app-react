import React, {useEffect, useRef, useState} from 'react';
import style from './Basket.module.scss';
import {useServer} from "./useServer";
import {useTelegram} from "../../../../hooks/useTelegram";
import useGlobalData from "../../../../hooks/useGlobalData";
import PositionBasket from "./Elements/PositionBasket";
import AccountData from "./Elements/AccountData";
import Promo from "./Elements/Promo";
import {Link, useNavigate} from "react-router-dom";
import Recommendations from "../Product/Elements/Recommendations";

const Basket = () => {

    const {getBasketList, createOrder} = useServer()
    const {user, tg} = useTelegram()
    const {pageId, catalogList, basket, updateBasket} = useGlobalData()
    const navigate = useNavigate();
    const [accountData, setAccountData] = useState('')
    const [promoData, setPromoData] = useState({percent: 0, name: ''})
    const [orderId, setOrderId] = useState(null)
    const [infoLabel, setInfoLabel] = useState('')
    const [username, setUsername] = useState('')
    const inputRef = useRef(null);

    useEffect(() => {
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', () => navigate(-1))
        return () => {
            tg.offEvent('backButtonClicked', () => navigate(-1))
        }
    }, [])

    if (orderId !== null) {
        return (<div style={{flexDirection: 'column', display: 'flex'}}>
            <div className={style['happyDuck']}/>
            <div className={style['label']}>{'Заказ №' + String(orderId) + ' успешно оформлен.'}</div>
            <div className={style['label']} style={{marginBottom: '5vw'}}>
                Совсем скоро с Вами свяжется наш менеджер - @gwstore_admin для оплаты и активации Вашего заказа.
            </div>
            <a className={style['linkElement']}
               href={'https://t.me/gwstore_admin'}>
                <button className={style['button']} style={{background: '#50A355'}}>
                    Написать менеджеру
                </button>
            </a>
            <Link to={'/'} className={style['linkElement']}>
                <button className={style['button']} style={{background: '#454545'}}>
                    Вернуться на главную
                </button>
            </Link>
        </div>)
    } else {
        if (basket !== null) {
            if (basket.length === 0) {
                return (<div className={style['emptyBasket']}>
                    <div/>
                    <div>В корзине ничего нет</div>
                    <div className={style['button']} onClick={() => {
                        navigate(window.location.pathname.replace('/basket', ''));
                    }}>Перейти к покупкам
                    </div>
                </div>)
            } else if (basket.length > 0) {
                return (<div
                    className={style['mainContainer']}
                    style={{paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px', paddingBottom: String(window.innerWidth * 0.15 + tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom) + 'px'}}>
                    <div className={style['basketBlock']}>
                        <p className={style['title']}>Ваша корзина:</p>
                        {basket.map((item, index) => (<>
                            <PositionBasket product={item} onReload={() => {
                                updateBasket(catalogList, pageId)
                            }}/>
                            {index !== basket.length - 1 ? (<div className={style['separator']} style={{height:'1px', marginTop:'0'}}/>) : ''}
                        </>))}
                    </div>

                    <div className={style['basketBlock']}>
                        <p className={style['title']}>Куда оформить заказ:</p>
                        <AccountData returnAccountData={setAccountData}/>
                    </div>

                    <div className={style['basketBlock']} style={{marginBottom: '0'}}>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <p className={style['title']}>Итого:</p>
                            <p className={style['title']} style={{marginLeft: 'auto', marginRight: '0'}}>
                                {basket.map(el => {
                                    return el.similarCard !== null ? el.similarCard.price : el.price
                                }).reduce((accumulator, currentValue) => accumulator + currentValue, 0) * (1 - promoData.percent / 100)}₽
                            </p>
                        </div>

                        <Promo setPromoData={setPromoData}/>

                        <div className={style['separator']}/>

                        <input className={style['usernameInput']} ref={inputRef}
                               placeholder={'Пример — gwstore_admin'} value={username}
                               onChange={e => {
                                   setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                                   setInfoLabel('')
                               }}/>

                        <div className={style['usernameLabel']}>
                            Введите Ваш никнейм в Telegram, чтобы мы могли связаться с Вами после оформления заказа
                        </div>

                        <button
                            className={style['buttonBuy']}
                            style={{background: (typeof user.username !== 'undefined' || username !== '' ? '#50A355' : '#7a7a7a')}}
                            onClick={() => {
                                if (typeof user.username !== 'undefined' || username !== '') {
                                    createOrder(accountData, {
                                        id: user.id, username: '@' + (user.username || username)
                                    }, pageId, promoData.name, ((res) => {
                                        setOrderId(res.number)
                                    })).then()
                                } else {
                                    setInfoLabel('*Обязательное для заполнения поле');
                                    inputRef.current.focus();
                                }
                            }}>
                            <div>Оформить заказ</div>
                        </button>
                        <div className={style['labelBuy']}>
                            Нажимая на кнопку, Вы соглашаетесь с
                            <a href={'https://t.me/gwstore_faq/12'}>
                                Условиями обработки персональных данных
                            </a>
                            , а также с
                            <a href={'https://t.me/gwstore_faq/11'}>
                                Пользовательским соглашением
                            </a>
                        </div>
                    </div>

                    <Recommendations/>
                </div>);
            }
        }
    }
};

export default Basket;

//
// <div className={style['title']}>Ваша корзина</div>
//
// {basket.map(item => (<PositionBasket product={item} onReload={() => {
//     updateBasket(catalogList, pageId)
// }}/>))}
//
// <div className={style['infoLabel']}>
//     {infoLabel}
// </div>
//
// <div className={style['usernameInput']}>
//     <input ref={inputRef} placeholder={'Ваш никнейм в Telegram для связи'} value={username}
//            onChange={e => {
//                setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
//                setInfoLabel('')
//            }}/>
// </div>
//
// {pageId !== 29 ? <AccountData returnAccountData={setAccountData}/> : ''}
//
// <Promo setPromoData={setPromoData}/>
//
// <div className={style['total']}
//      style={{marginTop: String(height - (tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom + tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top + 0.52 * window.innerWidth)) + 'px'}}>
//     <div>
//         <div>Итого к оплате:</div>
//         <div>{basket.map(el => {
//             return el.similarCard !== null ? el.similarCard.price : el.price
//         }).reduce((accumulator, currentValue) => accumulator + currentValue, 0) * (1 - promoData.percent / 100)}₽
//         </div>
//         {promoData.percent > 0 ? <div>
//             {basket.map(el => {
//                 return el.similarCard !== null ? el.similarCard.price : el.price
//             }).reduce((accumulator, currentValue) => accumulator + currentValue, 0)}₽
//         </div> : ''}
//     </div>

// </div>