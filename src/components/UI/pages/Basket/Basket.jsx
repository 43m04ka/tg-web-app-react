import React, {useEffect, useRef, useState} from 'react';
import style from './Basket.module.scss';
import {useServer} from "./useServer";
import {useTelegram} from "../../../../hooks/useTelegram";
import useGlobalData from "../../../../hooks/useGlobalData";
import PositionBasket from "./Elements/PositionBasket";
import AccountData from "./Elements/AccountData";
import Promo from "./Elements/Promo";
import {useNavigate} from "react-router-dom";
import Recommendations from "../../Elements/Recommendations/Recommendations";
import Payment from "./Elements/Payment";
import ButtonBuy from "./Elements/ButtonBuy";
import OrderPage from "./Elements/OrderPage";

const Basket = () => {

    const {createOrder} = useServer()
    const {user, tg} = useTelegram()
    const {pageId, catalogList, basket, updateBasket, pageList} = useGlobalData()
    const navigate = useNavigate();
    const [accountData, setAccountData] = useState('')
    const [promoData, setPromoData] = useState({percent: 0, name: ''})
    const [promoIsVisible, setPromoIsVisible] = useState(false)
    const [orderData, setOrderData] = useState(null)
    const [username, setUsername] = useState('')
    const inputRef = useRef(null);
    const [paymentString, setPaymentString] = useState('Способ оплаты: СБП')

    useEffect(() => {
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', () => navigate(-1))
        return () => {
            tg.offEvent('backButtonClicked', () => navigate(-1))
        }
    }, [])

    if (basket !== null) {
        if (basket.length === 0 && orderData === null) {
            return (<div style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflowY: 'scroll',
                height: '100vh',
                paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px',
                paddingBottom: String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom + 20) + 'px',
            }}>
                <div className={style['emptyBasket']}>
                    <div/>
                    <div>В корзине ничего нет</div>
                    <button className={style['button']} style={{background: '#454545'}} onClick={() => {
                        navigate(window.location.pathname.replace('/basket', ''));
                    }}>Перейти к покупкам
                    </button>
                </div>
                <Recommendations from={'basket'}/>
            </div>)
        } else if (basket.length > 0) {
            return (<div
                className={style['mainContainer']}
                style={{
                    paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px',
                    paddingBottom: String(window.innerWidth * 0.15 + tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom) + 'px'
                }}>
                <div className={style['basketBlock']}
                     style={{height: String(0.33372 * window.innerWidth * basket.length + (basket.length - 1) + 0.143 * window.innerWidth) + 'px'}}>
                    <p className={style['title']}>Ваша корзина:</p>
                    {basket.map((item, index) => (<>
                        <PositionBasket percent={promoData.percent} product={item} onReload={() => {
                            updateBasket(catalogList, pageId)
                        }}/>
                        {index !== basket.length - 1 ? (
                            <div className={style['separator']} style={{height: '1px', marginTop: '0'}}/>) : ''}
                    </>))}
                </div>

                <div className={style['basketBlock']}>
                    <p className={style['title']}>Куда оформить заказ:</p>
                    <AccountData returnAccountData={setAccountData}/>
                </div>

                <div className={style['basketBlock']} style={{marginBottom: '0'}}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <p className={style['title']}>Итого:</p>
                        {promoData.percent > 0 ? <p className={style['title']} style={{
                            margin: 'auto 1vw 0 auto',
                            fontSize: '4vw',
                            textDecoration: 'line-through',
                            color: '#757373',
                            lineHeight: '7vw'
                        }}>
                            {basket.map(el => {
                                return el.similarCard !== null ? el.similarCard.price * el.count : el.price * el.count
                            }).reduce((accumulator, currentValue) => accumulator + currentValue, 0)}₽
                        </p> : ''}
                        <p className={style['title']}
                           style={{marginRight: '0', marginLeft: promoData.percent > 0 ? '0' : 'auto'}}>
                            {basket.map(el => {
                                return el.similarCard !== null ? el.similarCard.price * el.count : el.price * el.count
                            }).reduce((accumulator, currentValue) => accumulator + currentValue, 0) * (1 - promoData.percent / 100)}₽
                        </p>
                    </div>

                    <Payment setPaymentMethodString={setPaymentString} sumPrice={basket.map(el => {
                        return el.similarCard !== null ? el.similarCard.price * el.count : el.price * el.count
                    }).reduce((accumulator, currentValue) => accumulator + currentValue, 0) * (1 - promoData.percent / 100)}/>

                    <div className={style['separator']}/>

                    {typeof user.username === 'undefined' ? (<>
                        <div className={style['usernameLabel']}>
                            Введите Ваш никнейм в Telegram, чтобы мы могли связаться с Вами после оформления заказа
                        </div>
                        <input className={style['usernameInput']} ref={inputRef}
                               placeholder={'Пример — gwstore_admin'} value={username}
                               onChange={e => {
                                   setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                               }}/>

                    </>) : ''}


                    <div style={{height: promoIsVisible ? '9vw' : '3vw', transition: 'all 0.3s'}}>
                        {promoIsVisible ? <Promo setPromoData={setPromoData}/> :
                            <div className={style['promoLabel']} onClick={() => {
                                setPromoIsVisible(true)
                            }}>У меня есть промокод</div>}
                    </div>

                    <ButtonBuy onBuy={(onLoaded) => {
                        navigate('/'+pageList.filter(item => item.id === pageId)[0].link + '/basket')

                        createOrder(paymentString, accountData, {
                            id: user.id, username: '@' + (user.username || username)
                        }, pageId, promoData.name, ((res) => {
                            setOrderData(res)
                            onLoaded()
                        })).then()
                    }} inputUsernameRef={inputRef} username={username}/>

                    <div className={style['labelBuy']}>
                        Нажимая на кнопку, Вы соглашаетесь с {}
                        <a href={'https://t.me/gwstore_faq/12'}>
                            Условиями обработки персональных данных
                        </a>
                        , а также с {}
                        <a href={'https://t.me/gwstore_faq/11'}>
                            Пользовательским соглашением
                        </a>
                    </div>
                </div>
                <Recommendations from={'basket'}/>
                {orderData !== null ? <OrderPage orderData={orderData}/> : ''}
            </div>);
        }
    }
};

export default Basket;