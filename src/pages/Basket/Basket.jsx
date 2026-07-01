import React, {useEffect, useRef, useState} from 'react';
import style from './Basket.module.scss';
import {useTelegram} from "../../hooks/useTelegram";
import useGlobalData from "../../hooks/useGlobalData";
import PositionBasket from "./Elements/PositionBasket";
import AccountData from "./Elements/AccountData";
import Promo from "./Elements/Promo";
import {useNavigate} from "react-router-dom";
import Recommendations from "../../shared/ui/Recommendations/Recommendations";
import Payment from "./Elements/Payment";
import ButtonBuy from "./Elements/ButtonBuy";
import OrderPage from "./Elements/OrderPage";
import OrderContact from "./Elements/OrderContact";
import {useServerUser} from "../../hooks/useServerUser";
import DesktopBasket from "./DesktopBasket/DesktopBasket";

const SIMULATE_ORDER = false;

const Basket = () => {

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handler = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    const {createOrder} = useServerUser()
    const { user, tg, safeAreaInset, contentSafeAreaInset, isVk, isTg, isWeb, vkGroupId } = useTelegram()
    const {pageId, catalogList, basket, updateBasket, pageList} = useGlobalData()
    const navigate = useNavigate();
    const [accountData, setAccountData] = useState('')
    const [promoData, setPromoData] = useState({percent: 0, name: ''})
    const [promoIsVisible, setPromoIsVisible] = useState(false)
    const [orderData, setOrderData] = useState(null)
    const [username, setUsername] = useState('')
    const inputRef = useRef(null);
    const [paymentString, setPaymentString] = useState('Способ оплаты: СБП')

    const getCurrentPageType = () => {
        if (!pageList || pageId === -1) return null;
        const currentPage = pageList.find(p => p.id === pageId);
        return currentPage?.type || null;
    }

    const pageType = getCurrentPageType();

    const isBuyEnabled = isVk
        ? true
        : (isTg ? (typeof user.username !== 'undefined' || username !== '') : username.trim() !== '');

    const orderUsername = isWeb
        ? username 
        :
        isVk
        ? `https://vk.com/im/convo/${user.id} \n${user.first_name} ${user.last_name}`
        : '@' + (user.username || username)

    const sourceData = isVk
        ? {source: 'vk', vkGroupId: vkGroupId}
        : (isTg ? {source: 'tg'} : {source: 'web'})

    useEffect(() => {
        tg.BackButton.show();
        const onBack = () => navigate(-1);
        tg.onEvent('backButtonClicked', onBack);
        return () => {
            tg.offEvent('backButtonClicked', onBack);
        };
    }, [navigate, tg]);

    if (isDesktop) {
        return <DesktopBasket />;
    }

    if (basket !== null) {
        if (basket.length === 0 && orderData === null) {
            return (<div style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflowY: 'scroll',
                height: '100vh',
                paddingTop: String(contentSafeAreaInset.top + safeAreaInset.top) + 'px',
                paddingBottom: String(contentSafeAreaInset.bottom + safeAreaInset.bottom + 20) + 'px',
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
                    paddingTop: String(contentSafeAreaInset.top + safeAreaInset.top) + 'px',
                    paddingBottom: String(window.innerWidth * 0.15 + contentSafeAreaInset.bottom + safeAreaInset.bottom) + 'px'
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

                {pageType !== 'other' && (
                    <div className={style['basketBlock']}>
                        <p className={style['title']}>Куда оформить заказ:</p>
                        <AccountData returnAccountData={setAccountData} pageType={pageType}/>
                    </div>
                )}

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

                    <OrderContact
                        username={username}
                        setUsername={setUsername}
                        inputRef={inputRef}
                    />


                    <div style={{height: promoIsVisible ? '9vw' : '3vw', transition: 'all 0.3s'}}>
                        {promoIsVisible ? <Promo setPromoData={setPromoData}/> :
                            <div className={style['promoLabel']} onClick={() => {
                                setPromoIsVisible(true)
                            }}>У меня есть промокод</div>}
                    </div>

                    <ButtonBuy onBuy={(onLoaded) => {
                        if (SIMULATE_ORDER) {
                            const sumPrice = basket
                                .map(el => el.similarCard !== null ? el.similarCard.price * el.count : el.price * el.count)
                                .reduce((acc, val) => acc + val, 0);
                            setTimeout(() => {
                                setOrderData({
                                    number: Math.floor(Math.random() * 9000) + 1000,
                                    list: basket,
                                    summa: sumPrice * (1 - promoData.percent / 100),
                                    message: null,
                                });
                                onLoaded();
                            }, 1500);
                            return;
                        }
                        navigate('/'+pageList.filter(item => item.id === pageId)[0].link + '/basket')

                        createOrder(paymentString, accountData, {
                            id: user.id, username: orderUsername
                        }, pageId, promoData.name, sourceData, ((res) => {
                            setOrderData(res)
                            onLoaded()
                        })).then()
                    }} inputUsernameRef={inputRef} isEnabled={isBuyEnabled}/>

                    <div className={style['labelBuy']}>
                        Нажимая на кнопку, Вы соглашаетесь с {}
                        <a href={'https://gwstore.su/pk'}>
                            Условиями обработки персональных данных
                        </a>
                        , а также с {}
                        <a href={'https://gwstore.su/privacy'}>
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
