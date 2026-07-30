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
import IndiaBasketBlock from "./BasketExchangeIndia/IndiaBasketBlock";
import ButtonBuy from "./Elements/ButtonBuy";
import OrderPage from "./Elements/OrderPage";
import OrderContact from "./Elements/OrderContact";
import {useServerUser} from "../../hooks/useServerUser";
import DesktopBasket from "./DesktopBasket/DesktopBasket";
import {usePlatform} from "../../hooks/utils/usePlatform";
import {usePlatformUser} from "../../hooks/usePlatformUser";
import {useAppInsets} from "../../hooks/useAppInsets";
import PaymentWaiting from "../../components/PaymentWaiting";
import PaymentSuccessDetails from "../../components/PaymentSuccessDetails";
import PaymentFailDetails from "../../components/PaymentFailDetails";
import OrderAccepted from "../../components/OrderAccepted";

const SIMULATE_ORDER = false;

const Basket = () => {

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handler = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    const { createOrder, checkPaymentStatus, getHistoryList } = useServerUser()
    const {tg, vkGroupId } = useTelegram()
    const { safeAreaInset, contentSafeAreaInset, isKeyboardOpen } = useAppInsets();
    const { user} = usePlatformUser();
    const { isVk, isTg, isWeb } = usePlatform();
    const { pageId, catalogList, basket, updateBasket, pageList } = useGlobalData()
    const navigate = useNavigate();
    const [accountData, setAccountData] = useState('—')
    const [promoData, setPromoData] = useState({ percent: 0, name: '' })
    const [promoIsVisible, setPromoIsVisible] = useState(false)
    const [orderData, setOrderData] = useState(null)
    const [orderError, setOrderError] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const inputRef = useRef(null);
    const [paymentString, setPaymentString] = useState('Способ оплаты: СБП')
    const [paymentMethod, setPaymentMethod] = useState('sbp')
    const [paymentScreen, setPaymentScreen] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(0);

    const getCurrentPageType = () => {
        if (!pageList || pageId === -1) return null;
        const currentPage = pageList.find(p => p.id === pageId);
        return currentPage?.type || null;
    }

    const pageType = getCurrentPageType();

    const getBasketTotalPrice = () => {
        if (!basket) return 0;

        if (pageType === 'ps_india') {
            const inrSum = basket
                .filter(el => el.priceInOtherCurrency !== null && el.priceInOtherCurrency !== undefined)
                .reduce((acc, el) => acc + (el.priceInOtherCurrency * el.count), 0);

            const rubFromInr = Math.ceil(inrSum / 1000) * 1000 * 1.3;

            const fixedRubSum = basket
                .filter(el => el.priceInOtherCurrency === null || el.priceInOtherCurrency === undefined)
                .reduce((acc, el) => {
                    const price = el.similarCard !== null ? el.similarCard.price : el.price;
                    return acc + (price * el.count);
                }, 0);

            return rubFromInr + fixedRubSum;
        } else {
            return basket.reduce((acc, el) => {
                const price = el.similarCard !== null ? el.similarCard.price : el.price;
                return acc + (price * el.count);
            }, 0);
        }
    }

    const totalRawPrice = getBasketTotalPrice();
    const totalFinalPrice = totalRawPrice * (1 - promoData.percent / 100);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isBuyEnabled = isVk
        ? (selectedPayment === 0 ? emailRegex.test(email.trim()) : true)
        : (isTg ? ((typeof user.username !== 'undefined' || username !== '') && (selectedPayment === 0 ? emailRegex.test(email.trim()) : true)) : (username.trim() !== '' && (selectedPayment === 0 ? emailRegex.test(email.trim()) : true)));

    const orderUsername = isWeb
        ? username
        :
        isVk
            ? `https://vk.com/im/convo/${user.id} \n${user.first_name} ${user.last_name}`
            : '@' + (user.username || username)

    const sourceData = isVk
        ? { source: 'vk', vkGroupId: vkGroupId }
        : (isTg ? { source: 'tg' } : { source: 'web' })

    useEffect(() => {
        tg.BackButton.show();
        const onBack = () => navigate(-1);
        tg.onEvent('backButtonClicked', onBack);
        return () => {
            tg.offEvent('backButtonClicked', onBack);
        };
    }, [navigate, tg]);

    const { internalUserId } = useGlobalData();

    const pollIntervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    const watchOrder = (orderId, { openPaymentUrl } = {}) => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
        }
        if (openPaymentUrl) {
            window.open(openPaymentUrl, '_blank');
        }
        setPaymentScreen('waiting');
        pollIntervalRef.current = setInterval(async () => {
            const statusData = await checkPaymentStatus(orderId);
            setPaymentStatus(statusData);

            if (statusData.status === 'paid') {
                clearInterval(pollIntervalRef.current);
                setPaymentScreen('success');
            } else if (statusData.status === 'payment_failed') {
                clearInterval(pollIntervalRef.current);
                setPaymentScreen('fail');
            }
        }, 5000);
    };

    useEffect(() => {
        const checkPendingOrders = async () => {
            if (!internalUserId) return;

            try {
                const orders = await new Promise((resolve) => {
                    getHistoryList(resolve, internalUserId);
                });

                if (orders && orders.length > 0) {
                    const today = new Date().toDateString();

                    const pendingOrder = orders.find(order => {
                        const isPending = order.type === 'catalog' && order.status === 'awaiting_payment';
                        const orderDate = order.createdAt ? new Date(order.createdAt).toDateString() : null;
                        const isToday = orderDate === today;

                        return isPending && isToday;
                    });

                    if (pendingOrder) {
                        setOrderData({
                            orderId: pendingOrder.id,
                            status: pendingOrder.status,
                            paymentMethod: pendingOrder.paymentMethod,
                            total: pendingOrder.total,
                            paymentUrl: pendingOrder.paymentUrl,
                        });
                        watchOrder(pendingOrder.id);
                    }
                }
            } catch (error) {
                console.error('Error checking pending orders:', error);
            }
        };

        checkPendingOrders();
    }, [internalUserId]);

    const handleClosePayment = () => {
        setPaymentScreen(null);
        setOrderData(null);
        setPaymentStatus(null);
    };

    const handleRetryPayment = () => {
        setPaymentScreen(null);
        setOrderData(null);
        setPaymentStatus(null);
    };

    // Рендеринг экранов оплаты
    if (paymentScreen === 'waiting') {
        return <PaymentWaiting paymentUrl={orderData?.paymentUrl} />;
    }

    if (paymentScreen === 'accepted') {
        return <OrderAccepted orderData={orderData} onClose={handleClosePayment} />;
    }

    if (paymentScreen === 'success') {
        return <PaymentSuccessDetails orderData={orderData} onClose={handleClosePayment} />;
    }

    if (paymentScreen === 'fail') {
        return <PaymentFailDetails orderData={orderData} onClose={handleClosePayment} onRetry={handleRetryPayment} />;
    }

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
                    <div />
                    <div>В корзине ничего нет</div>
                    <button className={style['button']} style={{ background: '#454545' }} onClick={() => {
                        navigate('/main/catalogs');
                    }}>Перейти к покупкам
                    </button>
                </div>
                <Recommendations from={'basket'} />
            </div>)
        } else if (basket.length > 0) {
            return (<div
                className={style['mainContainer']}
                style={{
                    paddingTop: String(contentSafeAreaInset.top + safeAreaInset.top) + 'px',
                    paddingBottom: String(window.innerWidth * 0.15 + contentSafeAreaInset.bottom + safeAreaInset.bottom) + 'px'
                }}>
                {pageType === 'ps_india' ? (
                    <IndiaBasketBlock
                        basket={basket}
                        style={style}
                        promoData={promoData}
                        catalogList={catalogList}
                        pageId={pageId}
                        updateBasket={updateBasket}
                    />
                ) : (
                    <div className={style['basketBlock']}
                        style={{ height: String(0.33372 * window.innerWidth * basket.length + (basket.length - 1) + 0.143 * window.innerWidth) + 'px' }}>
                        <p className={style['title']}>Ваша корзина:</p>
                        {basket.map((item, index) => (
                            <React.Fragment key={item.id || index}>
                                <PositionBasket
                                    percent={promoData.percent}
                                    product={item}
                                    onReload={() => {
                                        updateBasket(catalogList, pageId)
                                    }}
                                />
                                {index !== basket.length - 1 ? (
                                    <div className={style['separator']} style={{ height: '1px', marginTop: '0' }} />
                                ) : ''}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {pageType !== 'other' && (
                    <div className={style['basketBlock']}>
                        <p className={style['title']}>Куда оформить заказ:</p>
                        <AccountData returnAccountData={setAccountData} pageType={pageType} />
                    </div>
                )}

                <div className={style['basketBlock']} style={{ marginBottom: '0' }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <p className={style['title']}>Итого:</p>
                        {promoData.percent > 0 ? <p className={style['title']} style={{
                            margin: 'auto 1vw 0 auto',
                            fontSize: '4vw',
                            textDecoration: 'line-through',
                            color: '#757373',
                            lineHeight: '7vw'
                        }}>
                            {totalRawPrice}₽
                        </p> : ''}
                        <p className={style['title']}
                            style={{ marginRight: '0', marginLeft: promoData.percent > 0 ? '0' : 'auto' }}>
                            {totalFinalPrice}₽
                        </p>
                    </div>

                    <Payment setPaymentMethodString={setPaymentString} setPaymentMethod={setPaymentMethod} sumPrice={totalFinalPrice} setSelectedPayment={setSelectedPayment} />

                    <div className={style['separator']} />

                    <OrderContact
                        username={username}
                        setUsername={setUsername}
                        inputRef={inputRef}
                        email={email}
                        setEmail={setEmail}
                        showEmailField={selectedPayment === 0}
                    />


                    <div style={{ height: promoIsVisible ? '9vw' : '3vw', transition: 'all 0.3s' }}>
                        {promoIsVisible ? <Promo setPromoData={setPromoData} /> :
                            <div className={style['promoLabel']} onClick={() => {
                                setPromoIsVisible(true)
                            }}>У меня есть промокод</div>}
                    </div>

                    {orderError ? <p className={style['errorText']}>{orderError}</p> : ''}

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

                        setOrderError('');

                        createOrder({
                            pageId,
                            contact: orderUsername,
                            username: user.username || username,
                            accountData,
                            email: email.trim() || undefined,
                            paymentMethod,
                            promoCode: promoData.name,
                            platform: sourceData.source,
                            vkGroupId: sourceData.vkGroupId,
                        }, ((res) => {
                            onLoaded()

                            if (!res.ok) {
                                setOrderError(res.error || 'Не удалось оформить заказ');
                                return;
                            }

                            navigate('/main/basket')
                            setOrderData(res)

                            if (res.paymentUrl) {
                                watchOrder(res.orderId, { openPaymentUrl: res.paymentUrl });
                            } else {
                                setPaymentScreen('accepted');
                            }
                        })).then()
                    }} inputUsernameRef={inputRef} isEnabled={isBuyEnabled} />

                    <div className={style['labelBuy']}>
                        Нажимая на кнопку, Вы соглашаетесь с { }
                        <a href={'https://gwstore.su/pk'}>
                            Условиями обработки персональных данных
                        </a>
                        , а также с { }
                        <a href={'https://gwstore.su/privacy'}>
                            Пользовательским соглашением
                        </a>
                    </div>
                </div>
                <Recommendations from={'basket'} />
                {orderData !== null ? <OrderPage orderData={orderData} /> : ''}
            </div>);
        }
    }
};

export default Basket;
