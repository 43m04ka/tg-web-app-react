import React, {useEffect, useRef, useState} from 'react';
import style from './SteamCatalogs.module.scss';
import {useServerUser} from '../../../hooks/useServerUser';
import useGlobalData from '../../../hooks/useGlobalData';
import {useTelegram} from '../../../hooks/useTelegram';
import {usePlatformUser} from '../../../hooks/usePlatformUser';
import {usePlatform} from '../../../hooks/utils/usePlatform';
import PaymentWaiting from '../../../components/PaymentWaiting';
import PaymentSuccessDetails from '../../../components/PaymentSuccessDetails';
import PaymentFailDetails from '../../../components/PaymentFailDetails';

const RuFlag = () => (
    <svg width="24" height="16" viewBox="0 0 24 16" className={style['flagSvg']}>
        <rect width="24" height="16" fill="white" />
        <rect y="5.333" width="24" height="5.333" fill="#0000FF" />
        <rect y="10.667" width="24" height="5.333" fill="#FF0000" />
    </svg>
);

const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const MIN_AMOUNT = 100;
const MAX_AMOUNT = 50000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;

const SteamAccount = () => {
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('1000');
    const [loading, setLoading] = useState(false);
    const [quote, setQuote] = useState(null);
    const [quoteError, setQuoteError] = useState('');
    const [orderResult, setOrderResult] = useState(null);
    const [orderError, setOrderError] = useState('');
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentScreen, setPaymentScreen] = useState(null);
    const [paymentStalled, setPaymentStalled] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [emailError, setEmailError] = useState('');

    const {createSteamOrder, getSteamQuote, checkPaymentStatus, getHistoryList, cancelPayment} = useServerUser();
    const { internalUserId } = useGlobalData();
    const { tg } = useTelegram();
    const { user } = usePlatformUser();
    const { isVk, isTg } = usePlatform();
    const platform = isVk ? 'vk' : (isTg ? 'tg' : 'web');

    const presetAmounts = ['200', '500', '1000', '5000'];
    const amountNumber = parseFloat(amount) || 0;

    const pollIntervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (amountNumber < MIN_AMOUNT || amountNumber > MAX_AMOUNT) {
            setQuote(null);
            setQuoteError('');
            return;
        }

        let cancelled = false;
        const timeout = setTimeout(async () => {
            const result = await getSteamQuote(amountNumber);
            if (cancelled) return;
            if (result?.error) {
                setQuote(null);
                setQuoteError('Непредвиденная ошибка');
            } else {
                setQuote(result);
                setQuoteError('');
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [amountNumber]);

    const handleChange = (e) => {
        const cleanNumbers = e.target.value.replace(/\D/g, '');
        const numValue = Number(cleanNumbers);

        if (numValue > MAX_AMOUNT) {
            setAmount(String(MAX_AMOUNT));
        } else {
            setAmount(cleanNumbers);
        }
    };

    const handleLoginChange = (e) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
        setLogin(value);
        if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
            setLoginError('Логин должен содержать только латиницу и цифры');
        } else {
            setLoginError('');
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
    };

    const handleEmailBlur = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email.trim())) {
            setEmailError('некорректный Email');
        } else {
            setEmailError('');
        }
    };

    const handleBlur = () => {
        const num = Number(amount);
        if (!amount || num < MIN_AMOUNT) {
            setAmount(String(MIN_AMOUNT));
        }
    };

    const watchOrder = (orderId, paymentUrl, { openPaymentUrl = true } = {}) => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
        }
        if (openPaymentUrl) {
            window.open(paymentUrl, '_blank');
        }
        setPaymentScreen('waiting');
        setPaymentStalled(false);

        // Зачисление в Steam идёт после оплаты и обычно занимает минуты, но при сбое выдачи
        // заказ остаётся в `paid` — поэтому ждём ограниченное время, а не бесконечно
        const startedAt = Date.now();
        let lastStatus = null;
        let lastPayoutStatus = null;

        pollIntervalRef.current = setInterval(async () => {
            const statusData = await checkPaymentStatus(orderId);
            if (statusData?.status) {
                setPaymentStatus(statusData);
                lastStatus = statusData.status;
                lastPayoutStatus = statusData.payoutStatus;
            }

            if (lastStatus === 'completed' && lastPayoutStatus === 'success') {
                clearInterval(pollIntervalRef.current);
                setPaymentScreen('success');
            } else if (lastStatus === 'payment_failed') {
                clearInterval(pollIntervalRef.current);
                setPaymentScreen('fail');
            } else if (lastStatus === 'canceled') {
                clearInterval(pollIntervalRef.current);
                handleClosePayment();
            } else if (lastPayoutStatus === 'error') {
                // Выдача сорвалась — деньги получены, дальше разбирается менеджер,
                // крутить спиннер бесконечно незачем
                clearInterval(pollIntervalRef.current);
                setPaymentStalled(true);
            } else if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
                clearInterval(pollIntervalRef.current);
                setPaymentStalled(true);
            }
        }, 5000);
    };

    const handlePayment = async () => {
        if (!login.trim()) {
            tg.showAlert('Пожалуйста, введите логин Steam');
            return;
        }

        if (!email.trim()) {
            tg.showAlert('Пожалуйста, введите email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            tg.showAlert('Пожалуйста, введите корректный email');
            return;
        }

        if (amountNumber < MIN_AMOUNT || amountNumber > MAX_AMOUNT) {
            tg.showAlert(`Сумма пополнения должна быть от ${MIN_AMOUNT} до ${MAX_AMOUNT}₽`);
            return;
        }

        setLoading(true);
        setOrderError('');
        setLoginError('');

        await createSteamOrder({
            platform,
            contact: login,
            username: user.username,
            steamLogin: login,
            email: email.trim(),
            amount: amountNumber,
        }, (res) => {
            setLoading(false);

            if (!res.ok) {
                // Пользовательские ошибки сервер шлёт на русском и готовыми к показу как есть;
                // служебные (например, про сам platform) — на английском, их покупателю не показываем
                const serverError = typeof res.error === 'string' ? res.error : '';
                const isUserFacing = /[а-яё]/i.test(serverError);

                if (isUserFacing && /логин/i.test(serverError)) {
                    // Касса не нашла аккаунт Steam — показываем прямо под полем ввода
                    setLoginError(serverError);
                } else if (isUserFacing) {
                    tg.showAlert(serverError);
                    setOrderError(serverError);
                } else {
                    setOrderError('Непредвиденная ошибка');
                    tg.showAlert('Непредвиденная ошибка');
                }
                return;
            }

            setOrderResult(res);

            if (res.paymentUrl) {
                watchOrder(res.orderId, res.paymentUrl);
            }
        });
    };

    const handleClosePayment = () => {
        setPaymentScreen(null);
        setOrderResult(null);
        setPaymentStatus(null);
        setPaymentStalled(false);
    };

    const handleRetryPayment = () => {
        setPaymentScreen(null);
        setOrderResult(null);
        setPaymentStatus(null);
        setPaymentStalled(false);
    };

    // Возвращает текст для показа пользователю, если отменить не удалось; иначе ничего
    const handleCancelPayment = async () => {
        const orderId = orderResult?.orderId;
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
            setPaymentStatus({status: res.status});
            if (res.status === 'completed') {
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                }
                setPaymentScreen('success');
            }
            return;
        }

        return res.error || 'Не удалось отменить оплату';
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

                    const pendingSteamOrder = orders.find(order => {
                        const isPending = order.type === 'steam_topup'
                            && (order.status === 'awaiting_payment' || order.status === 'paid');
                        const orderDate = order.createdAt ? new Date(order.createdAt).toDateString() : null;
                        const isToday = orderDate === today;

                        return isPending && isToday;
                    });

                    if (pendingSteamOrder) {
                        setOrderResult({
                            orderId: pendingSteamOrder.id,
                            status: pendingSteamOrder.status,
                            topupAmount: pendingSteamOrder.topupAmount,
                            total: pendingSteamOrder.total,
                            paymentUrl: pendingSteamOrder.paymentUrl,
                        });
                        setPaymentStatus({status: pendingSteamOrder.status});
                        if (pendingSteamOrder.steamLogin) {
                            setLogin(pendingSteamOrder.steamLogin);
                        }
                        watchOrder(pendingSteamOrder.id, pendingSteamOrder.paymentUrl, {
                            openPaymentUrl: pendingSteamOrder.status !== 'paid',
                        });
                    }
                }
            } catch (error) {
                console.error('Error checking pending orders:', error);
            }
        };

        checkPendingOrders();
    }, [internalUserId]);

    // Рендеринг экранов оплаты
    if (paymentScreen === 'waiting') {
        return (
            <PaymentWaiting
                paymentUrl={orderResult?.paymentUrl}
                status={paymentStatus?.status}
                payoutStatus={paymentStatus?.payoutStatus}
                stalled={paymentStalled}
                orderData={orderResult}
                extraRows={login ? [{label: 'Steam аккаунт', value: login}] : []}
                onCancel={orderResult?.orderId ? handleCancelPayment : undefined}
            />
        );
    }

    if (paymentScreen === 'success') {
        const isCompleted = paymentStatus?.status === 'completed';
        return (
            <PaymentSuccessDetails
                orderData={orderResult}
                extraRows={[{label: 'Steam аккаунт', value: login}]}
                onClose={handleClosePayment}
                title={isCompleted ? 'Готово!' : 'Оплата успешна!'}
                statusText={isCompleted ? 'Зачислено на баланс Steam' : 'Оплачено, зачисляем'}
                message={isCompleted
                    ? 'Баланс Steam пополнен. Спасибо за заказ!'
                    : 'Оплата получена, пополнение уже в работе. Если баланс не изменится в ближайшее время, напишите менеджеру.'}
            />
        );
    }

    if (paymentScreen === 'fail') {
        return <PaymentFailDetails orderData={orderResult} extraRows={[{label: 'Steam аккаунт', value: login}]} onClose={handleClosePayment} onRetry={handleRetryPayment} />;
    }

    return (
        <div className={style['appContainer']}>
            <div className={style['scrollContent']}>

                <h className={style.introText}>
                    Пополнение
                    <a> Steam</a>
                </h>

                <div className={style['card']}>
                    <div className={style['inputContainer']}>
                        <input
                            type="text"
                            placeholder="Логин Steam"
                            className={style['nativeInput']}
                            value={login}
                            onChange={handleLoginChange}
                            style={{borderColor: loginError ? '#ff0000' : ''}}
                        />
                        {loginError && <div className={style['errorText']}>{loginError}</div>}
                    </div>
                    <div className={style['inputContainer']} style={{marginTop: '16px'}}>
                        <input
                            type="text"
                            placeholder="Ваш Email"
                            className={style['nativeInput']}
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                            style={{borderColor: emailError ? '#ff0000' : ''}}
                        />
                        {emailError && <div className={style['errorText']}>{emailError}</div>}
                    </div>
                </div>

                <div className={style['card']}>
                    <div className={style['sectionTitle']}>Сумма пополнения</div>
                    <div className={style['explicitAmountWrapper']}>
                        <RuFlag />
                        <div className={style.currencyInputContainer}>
                            <div className={style.inputWrapper}>
                                <input
                                    type="text"
                                    className={style.amountInputField}
                                    value={amount}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="100"
                                />
                                <span className={style.inputBuffer} aria-hidden="true">
                                    {amount || '100'}
                                </span>
                                <span className={style.currencySymbol}>₽</span>
                            </div>
                        </div>
                    </div>

                    <div className={style['gridPresets']}>
                        {presetAmounts.map((preset) => (
                            <button
                                key={preset}
                                className={`${style['presetBtn']} ${amount === preset ? style['activePreset'] : ''}`}
                                onClick={() => setAmount(preset)}
                            >
                                {preset} ₽
                            </button>
                        ))}
                    </div>
                </div>

                <div className={style['card']}>
                    <div className={style['sectionTitle']}>К оплате</div>
                    <div className={style['totalSum']}>{quote ? `${quote.total} ₽` : '—'}</div>
                    {quote?.topupAmount ? (
                        <div className={style['errorText']} style={{color: '#8E8E93'}}>
                            На баланс Steam зачислится {quote.topupAmount} ₽
                        </div>
                    ) : ''}
                    {quoteError ? <div className={style['errorText']}>{quoteError}</div> : ''}
                </div>

                {orderError ? <div className={style['errorText']}>{orderError}</div> : ''}

                <button
                    className={style['mainPayBtn']}
                    onClick={handlePayment}
                    disabled={loading || !quote}
                >
                    {loading ? 'Создание заказа...' : 'Перейти к оплате'}
                </button>

                <div className={style['legalText']}>
                    Нажимая на кнопку, Вы принимаете условия <span className={style['link']}>Пользовательского Соглашения</span> и <span className={style['link']}>Политики Конфиденциальности</span>.
                </div>
            </div>
        </div>
    );
};

export default SteamAccount;
