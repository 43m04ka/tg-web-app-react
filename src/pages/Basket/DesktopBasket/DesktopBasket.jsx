import React, {useEffect, useRef, useState} from 'react';
import style from './DesktopBasket.module.scss';
import {useTelegram} from '../../../hooks/useTelegram';
import useGlobalData from '../../../hooks/useGlobalData';
import {useNavigate} from 'react-router-dom';
import Recommendations from '../../../shared/ui/Recommendations/Recommendations';
import {useServerUser} from '../../../hooks/useServerUser';
import DesktopPositionBasket from './DesktopPositionBasket';
import DesktopAccountData from './DesktopAccountData';
import DesktopPayment from './DesktopPayment';
import DesktopPromo from './DesktopPromo';
import DesktopButtonBuy from './DesktopButtonBuy';
import DesktopOrderPage from './DesktopOrderPage';
import DesktopOrderContact from './DesktopOrderContact';
import DesktopEmptyBasket from './DesktopEmptyBasket';
import {usePlatform} from "../../../hooks/utils/usePlatform";
import {usePlatformUser} from "../../../hooks/usePlatformUser";
import IndiaBasketBlock from '../BasketExchangeIndia/IndiaBasketBlock';
import PaymentWaiting from '../../../components/PaymentWaiting';
import PaymentSuccessDetails from '../../../components/PaymentSuccessDetails';
import PaymentFailDetails from '../../../components/PaymentFailDetails';
import OrderAccepted from '../../../components/OrderAccepted'; // Импорт логики Индии

const SIMULATE_ORDER = false;

const DesktopBasket = () => {
    const { createOrder, checkPaymentStatus, getHistoryList, cancelPayment } = useServerUser();
    const { tg, vkGroupId } = useTelegram();
    const { user } = usePlatformUser();
    const { isVk, isTg, isWeb } = usePlatform();
    const { pageId, basket, pageList, bufferCardsRecommendations, catalogList, updateBasket } = useGlobalData();
    const navigate = useNavigate();

    const [accountData, setAccountData] = useState('—');
    const [promoData, setPromoData] = useState({ percent: 0, name: '' });
    const [promoIsVisible, setPromoIsVisible] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [orderError, setOrderError] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const inputRef = useRef(null);
    const [paymentString, setPaymentString] = useState('Способ оплаты: СБП');
    const [paymentMethod, setPaymentMethod] = useState('sbp');
    const [paymentScreen, setPaymentScreen] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(0);

    const pageType = (!pageList || pageId === -1) ? null : (pageList.find(p => p.id === pageId)?.type || null);

    // Логика расчета цены, учитывающая Индию
    const getBasketTotalPrice = () => {
        if (!basket) return 0;
        if (pageType === 'ps_india') {
            const inrSum = basket
                .filter(el => el.priceInOtherCurrency !== null && el.priceInOtherCurrency !== undefined)
                .reduce((acc, el) => acc + (el.priceInOtherCurrency * el.count), 0);
            const rubFromInr = Math.ceil(inrSum / 1000) * 1000 * 1.3;
            const fixedRubSum = basket
                .filter(el => el.priceInOtherCurrency === null || el.priceInOtherCurrency === undefined)
                .reduce((acc, el) => acc + ((el.similarCard ? el.similarCard.price : el.price) * el.count), 0);
            return rubFromInr + fixedRubSum;
        } else {
            return basket.reduce((acc, el) => acc + ((el.similarCard ? el.similarCard.price : el.price) * el.count), 0);
        }
    };

    const sumPrice = getBasketTotalPrice();
    const totalPrice = sumPrice * (1 - promoData.percent / 100);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isBuyEnabled = isVk
        ? (selectedPayment === 0 ? emailRegex.test(email.trim()) : true)
        : (isTg ? ((typeof user.username !== 'undefined' || username !== '') && (selectedPayment === 0 ? emailRegex.test(email.trim()) : true)) : (username.trim() !== '' && (selectedPayment === 0 ? emailRegex.test(email.trim()) : true)));

    const orderUsername = isWeb
        ? username
        : isVk
            ? `https://vk.com/im/convo/${user.id} \n${user.first_name} ${user.last_name}`
            : '@' + (user.username || username);

    const sourceData = isVk
        ? { source: 'vk', vkGroupId: vkGroupId }
        : (isTg ? { source: 'tg' } : { source: 'web' });

    useEffect(() => {
        tg.BackButton.show();
        const onBack = () => navigate(-1);
        tg.onEvent('backButtonClicked', onBack);
        return () => tg.offEvent('backButtonClicked', onBack);
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
            } else if (statusData.status === 'canceled') {
                clearInterval(pollIntervalRef.current);
                setPaymentScreen(null);
                setOrderData(null);
                setPaymentStatus(null);
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

    // Возвращает текст для показа пользователю, если отменить не удалось; иначе ничего
    const handleCancelPayment = async () => {
        const orderId = orderData?.orderId;
        if (!orderId) return;

        const res = await cancelPayment(orderId);

        if (res.ok) {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
            handleClosePayment();
            return;
        }

        // Гонка с подтверждением кассы: заказ уже оплачен, пока жали «Отменить»
        if (res.httpStatus === 409 && (res.status === 'paid' || res.status === 'completed')) {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
            setPaymentStatus({status: res.status});
            setPaymentScreen('success');
            return;
        }

        return res.error || 'Не удалось отменить оплату';
    };

    // Рендеринг экранов оплаты
    if (paymentScreen === 'waiting') {
        return (
            <PaymentWaiting
                paymentUrl={orderData?.paymentUrl}
                status={paymentStatus?.status}
                onCancel={orderData?.orderId ? handleCancelPayment : undefined}
            />
        );
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

    if (basket === null) return null;
    if (basket.length === 0 && orderData === null) return <DesktopEmptyBasket />;

    return (
        <div className={style.mainContainer}>
            <div className={style.contentWrapper}>
                    {pageType === 'ps_india' ? (
                        <IndiaBasketBlock
                            basket={basket}
                            style={style}
                            desktop={true}
                            promoData={promoData}
                            catalogList={catalogList}
                            pageId={pageId}
                            updateBasket={updateBasket}
                        />
                    ) : (
                        <div className={style.basketBlock}>
                            <p className={style.title}>Ваша корзина:</p>
                            {basket.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <DesktopPositionBasket percent={promoData.percent} product={item} />
                                    {index !== basket.length - 1 && <div className={style.separator} />}
                                </React.Fragment>
                            ))}
                        </div>)}


                {/* «Сервисы» не привязаны к игровой консоли: логин PSN или Xbox там просить
                    не у чего. Оплата при этом обычная, как у ps/xbox, — особый режим есть
                    только у ps_india и Steam. */}
                {pageType !== null && pageType !== 'other' && pageType !== 'services' && (
                    <div className={style.basketBlock}>
                        <p className={style.title}>Куда оформить заказ:</p>
                        <DesktopAccountData returnAccountData={setAccountData} pageType={pageType} />
                    </div>
                )}

                <div className={style.basketBlock}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <p className={style.title}>Итого:</p>
                        {promoData.percent > 0 && <p className={style.oldPrice}>{sumPrice}₽</p>}
                        <p className={style.title} style={{ marginRight: '0', marginLeft: promoData.percent > 0 ? '0' : 'auto' }}>
                            {totalPrice}₽
                        </p>
                    </div>

                    <DesktopPayment setPaymentMethodString={setPaymentString} setPaymentMethod={setPaymentMethod} sumPrice={totalPrice} setSelectedPayment={setSelectedPayment} selectedPayment={selectedPayment} />
                    <div className={style.separator} />
                    <DesktopOrderContact username={username} setUsername={setUsername} inputRef={inputRef} email={email} setEmail={setEmail} showEmailField={selectedPayment === 0} />

                    <div style={{ height: promoIsVisible ? '46px' : '36px', transition: 'all 0.3s' }}>
                        {promoIsVisible ? (
                            <DesktopPromo setPromoData={setPromoData} />
                        ) : (
                            <div className={style.promoLabel} onClick={() => setPromoIsVisible(true)}>
                                У меня есть промокод
                            </div>
                        )}
                    </div>

                    {orderError ? <p className={style.errorText}>{orderError}</p> : ''}

                    <DesktopButtonBuy
                        onBuy={(onLoaded) => {
                            if (SIMULATE_ORDER) {
                                setTimeout(() => {
                                    setOrderData({ number: 1234, list: basket, summa: totalPrice, message: null });
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
                            }, (res) => {
                                onLoaded();

                                if (!res.ok) {
                                    setOrderError('Непредвиденная ошибка');
                                    return;
                                }

                                setOrderData(res);

                                if (res.paymentUrl) {
                                    watchOrder(res.orderId, { openPaymentUrl: res.paymentUrl });
                                } else {
                                    setPaymentScreen('accepted');
                                }
                            });
                        }}
                        inputUsernameRef={inputRef}
                        isEnabled={isBuyEnabled}
                    />

                    <div className={style.labelBuy}>
                        Нажимая на кнопку, Вы соглашаетесь с <a href={'https://gwstore.su/pk'}>Условиями обработки персональных данных</a>, а также с <a href={'https://gwstore.su/privacy'}>Пользовательским соглашением</a>
                    </div>
                </div>
            </div>
            <Recommendations from={'basket'} desktop data={bufferCardsRecommendations} />
            {orderData !== null && <DesktopOrderPage orderData={orderData} />}
        </div>
    );
};

export default DesktopBasket;